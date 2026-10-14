import { calculateRouteTrendInsights } from '../../utils/trendPrediction';
import { evaluateDeal } from '../../utils/thermometer';
import { analyzeOfferEconomilha } from '../../utils/economilha';
import React, { useState, useMemo } from 'react';
import { useFlySync } from '../../store/FlySyncContext';
import { OfferDetailModal } from './OfferDetailModal';
import { RouteCalendarModal } from './RouteCalendarModal';
import { PushNotificationManagerCard } from '../notifications/PushNotificationManagerCard';
import { ErrorBoundary } from '../common/ErrorBoundary';
import { FlightOffer } from '../../types';
import {
  Search,
  Plane,
  ShieldCheck,
  Calendar,
  Sparkles,
  ChevronRight,
  RotateCcw,
  LayoutGrid,
  MapPin,
  TrendingDown,
  ArrowRight,
  Bell,
  BellRing,
  Flame,
  Users
} from 'lucide-react';

interface RadarViewProps {
  onOpenCreateAlertForRoute: (origin: string, dest: string, maxMiles: number, progId?: string) => void;
}

export const RadarView: React.FC<RadarViewProps> = ({ onOpenCreateAlertForRoute }) => {
  const {
    offers,
    programs,
    selectedOffer,
    setSelectedOffer,
    savedSearches,
    observations,
    openPushModalForRoute
  } = useFlySync();

  // Filter States
  const [originSearch, setOriginSearch] = useState<string>('');
  const [destSearch, setDestSearch] = useState<string>('');
  const [selectedProgram, setSelectedProgram] = useState<string>('all');
  const [cabinClass, setCabinClass] = useState<string>('all');
  const [tripType, setTripType] = useState<string>('all');
  const [maxMiles, setMaxMiles] = useState<number>(150000);
  const [selectedMonth, setSelectedMonth] = useState<string>('all'); // e.g. 'all' or '2026-11'
  const [sortBy, setSortBy] = useState<'miles_asc' | 'date_desc' | 'verified_desc' | 'cash_asc'>('miles_asc');

  // View Mode: 'cards' (individual offers) or 'routes' (grouped multi-month routes)
  const [viewMode, setViewMode] = useState<'cards' | 'routes'>('routes');

  // Calendar Modal State
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [calendarRouteKey, setCalendarRouteKey] = useState<string | null>(null);
  const [calendarInitialOffer, setCalendarInitialOffer] = useState<FlightOffer | null>(null);

  // Quick Preset Routes
  const quickRoutes = [
    { label: 'Todas as Rotas', origin: '', dest: '' },
    { label: 'GRU ➔ Miami', origin: 'GRU', dest: 'MIA' },
    { label: 'GIG ➔ Madri (Executiva)', origin: 'GIG', dest: 'MAD', cabin: 'business' },
    { label: 'SP ➔ Buenos Aires', origin: 'GRU', dest: 'EZE' },
    { label: 'VCP ➔ Orlando', origin: 'VCP', dest: 'MCO' },
    { label: 'Nordeste ➔ Lisboa', origin: 'FOR', dest: 'LIS' },
    { label: 'Nacionais (Ponte & Praia)', origin: 'CGH', dest: 'REC' }
  ];

  // Extract all unique months available across offers for quick pill filtering
  const availableMonths = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const map = new Map<string, { label: string; count: number }>();
    offers.forEach(o => {
      if (o.status !== 'ativa' || o.departureDate < todayStr) return;
      const parts = o.departureDate.split('-');
      if (parts.length >= 2) {
        const key = `${parts[0]}-${parts[1]}`;
        const dateObj = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, 1);
        const label = dateObj.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
        if (!map.has(key)) {
          map.set(key, { label, count: 0 });
        }
        map.get(key)!.count += 1;
      }
    });

    return Array.from(map.entries())
      .map(([key, data]) => ({ key, ...data }))
      .sort((a, b) => a.key.localeCompare(b.key));
  }, [offers]);

  const handleApplyPreset = (route: typeof quickRoutes[0]) => {
    setOriginSearch(route.origin);
    setDestSearch(route.dest);
    if (route.cabin) {
      setCabinClass(route.cabin);
    } else {
      setCabinClass('all');
    }
  };

  const handleResetFilters = () => {
    setOriginSearch('');
    setDestSearch('');
    setSelectedProgram('all');
    setCabinClass('all');
    setTripType('all');
    setMaxMiles(150000);
    setSelectedMonth('all');
    setSortBy('miles_asc');
  };

  // Filtered & Sorted Offers
  const filteredOffers = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    return offers.filter((offer) => {
      if (offer.status !== 'ativa') return false;
      if (offer.departureDate < todayStr) return false;

      // Origin filter
      if (originSearch.trim()) {
        const query = originSearch.toLowerCase().trim();
        const matchCode = offer.origin.toLowerCase().includes(query);
        const matchCity = offer.originCity.toLowerCase().includes(query);
        if (!matchCode && !matchCity) return false;
      }

      // Destination filter
      if (destSearch.trim()) {
        const query = destSearch.toLowerCase().trim();
        const matchCode = offer.destination.toLowerCase().includes(query);
        const matchCity = offer.destCity.toLowerCase().includes(query);
        if (!matchCode && !matchCity) return false;
      }

      // Program filter
      if (selectedProgram !== 'all' && offer.programId !== selectedProgram) {
        return false;
      }

      // Cabin filter
      if (cabinClass !== 'all' && offer.cabinClass !== cabinClass) {
        return false;
      }

      // Trip type filter
      if (tripType !== 'all' && offer.tripType !== tripType) {
        return false;
      }

      // Month filter
      if (selectedMonth !== 'all' && !offer.departureDate.startsWith(selectedMonth)) {
        return false;
      }

      // Max miles filter
      if (offer.miles > maxMiles) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'miles_asc') return a.miles - b.miles;
      if (sortBy === 'cash_asc') return a.cashAmount - b.cashAmount;
      if (sortBy === 'verified_desc') {
        return new Date(b.verifiedAt).getTime() - new Date(a.verifiedAt).getTime();
      }
      if (sortBy === 'date_desc') {
        return new Date(a.departureDate).getTime() - new Date(b.departureDate).getTime();
      }
      return 0;
    });
  }, [offers, originSearch, destSearch, selectedProgram, cabinClass, tripType, selectedMonth, maxMiles, sortBy]);

  // Grouped Routes calculation for Multi-Month View
  const groupedRoutes = useMemo(() => {
    const map = new Map<string, {
      routeKey: string;
      origin: string;
      originCity: string;
      destination: string;
      destCity: string;
      airline: string;
      cabinClass: string;
      programId: string;
      lowestMiles: number;
      offers: FlightOffer[];
      months: Map<string, { label: string; count: number; minMiles: number }>;
    }>();

    filteredOffers.forEach(o => {
      const key = `${o.origin}-${o.destination}`;
      if (!map.has(key)) {
        map.set(key, {
          routeKey: key,
          origin: o.origin,
          originCity: o.originCity,
          destination: o.destination,
          destCity: o.destCity,
          airline: o.airline,
          cabinClass: o.cabinClass,
          programId: o.programId,
          lowestMiles: o.miles,
          offers: [],
          months: new Map()
        });
      }

      const group = map.get(key)!;
      group.offers.push(o);
      if (o.miles < group.lowestMiles) {
        group.lowestMiles = o.miles;
      }

      // Track months
      const parts = o.departureDate.split('-');
      if (parts.length >= 2) {
        const mKey = `${parts[0]}-${parts[1]}`;
        const dateObj = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, 1);
        const mLabel = dateObj.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
        if (!group.months.has(mKey)) {
          group.months.set(mKey, { label: mLabel, count: 0, minMiles: Infinity });
        }
        const mData = group.months.get(mKey)!;
        mData.count += 1;
        if (o.miles < mData.minMiles) mData.minMiles = o.miles;
      }
    });

    return Array.from(map.values()).map(g => ({
      ...g,
      monthsList: Array.from(g.months.entries()).map(([mKey, data]) => ({
        key: mKey,
        ...data
      })).sort((a, b) => a.key.localeCompare(b.key))
    })).sort((a, b) => a.lowestMiles - b.lowestMiles);
  }, [filteredOffers]);

  // Count available offers for a specific route
  const getRouteOfferCount = (origin: string, dest: string) => {
    const todayStr = new Date().toISOString().split('T')[0];
    return offers.filter(o => o.origin === origin && o.destination === dest && o.status === 'ativa' && o.departureDate >= todayStr).length;
  };

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

  const formatRelativeTime = (isoStr: string) => {
    try {
      const now = new Date().getTime();
      const time = new Date(isoStr).getTime();
      const diffMinutes = Math.floor((now - time) / (1000 * 60));
      if (diffMinutes < 60) return `Há ${diffMinutes || 1} min`;
      const diffHours = Math.floor(diffMinutes / 60);
      if (diffHours < 24) return `Há ${diffHours} h`;
      return new Date(isoStr).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
    } catch {
      return 'Recente';
    }
  };

  const handleOpenCalendar = (routeKey: string, initialOffer?: FlightOffer) => {
    setCalendarRouteKey(routeKey);
    setCalendarInitialOffer(initialOffer || null);
    setIsCalendarOpen(true);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150 text-white">
      {/* View Header */}
      <div className="pb-4 border-b border-purple-900/40">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Radar de Passagens
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl">
              Encontre passagens baratas em milhas.
            </p>
          </div>

          {/* View Mode Toggle: Cards vs. Grouped Routes */}
          <div className="flex items-center p-1 bg-[#160833] border border-purple-800/80 rounded-xl self-start md:self-auto shrink-0">
            <button
              onClick={() => setViewMode('cards')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                viewMode === 'cards'
                  ? 'bg-[#22C55E] text-slate-950 font-bold shadow-sm'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Ofertas</span>
            </button>
            <button
              onClick={() => setViewMode('routes')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                viewMode === 'routes'
                  ? 'bg-[#22C55E] text-slate-950 font-bold shadow-sm'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Por rota</span>
            </button>
          </div>
        </div>
      </div>

      {/* PRD 4.2 Push Notification Bar for Radar */}
      <PushNotificationManagerCard compact={true} />

      {/* Quick Preset Route Buttons */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs -mx-3 px-3 sm:mx-0 sm:px-0">
        <span className="text-slate-400 font-semibold shrink-0 pr-1 flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-[#22C55E]" />
          Rotas populares:
        </span>
        {quickRoutes.map((r, i) => {
          const isActive = originSearch === r.origin && destSearch === r.dest;
          return (
            <button
              key={i}
              onClick={() => handleApplyPreset(r)}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap shrink-0 font-medium transition-colors border ${
                isActive
                  ? 'bg-[#22C55E] text-slate-950 font-bold border-[#22C55E] shadow-sm'
                  : 'bg-[#160833] text-slate-300 border-purple-800/60 hover:bg-purple-900/40 hover:text-white'
              }`}
            >
              {r.label}
            </button>
          );
        })}
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#13062C] border border-purple-900/60 shadow-xl space-y-4">
        {/* Row 1: Search Inputs + Filtro de Mês Integrado */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {/* Origin */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Origem (Aeroporto ou Cidade)
            </label>
            <div className="relative">
              <input
                type="text"
                value={originSearch}
                onChange={(e) => setOriginSearch(e.target.value)}
                placeholder="Ex: GRU, GIG, São Paulo..."
                className="w-full pl-8 pr-3 py-2 text-xs border border-purple-800/80 rounded-lg bg-[#1A0B3B] text-white focus:ring-2 focus:ring-[#22C55E] focus:outline-hidden uppercase font-mono placeholder:font-sans placeholder:normal-case placeholder:text-slate-500"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            </div>
          </div>

          {/* Destination */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Destino (Aeroporto ou Cidade)
            </label>
            <div className="relative">
              <input
                type="text"
                value={destSearch}
                onChange={(e) => setDestSearch(e.target.value)}
                placeholder="Ex: MIA, LIS, MAD, Paris..."
                className="w-full pl-8 pr-3 py-2 text-xs border border-purple-800/80 rounded-lg bg-[#1A0B3B] text-white focus:ring-2 focus:ring-[#22C55E] focus:outline-hidden uppercase font-mono placeholder:font-sans placeholder:normal-case placeholder:text-slate-500"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            </div>
          </div>

          {/* Program */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Programa de Fidelidade
            </label>
            <select
              value={selectedProgram}
              onChange={(e) => setSelectedProgram(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-purple-800/80 rounded-lg bg-[#1A0B3B] text-white focus:ring-2 focus:ring-[#22C55E] focus:outline-hidden"
            >
              <option value="all" className="bg-[#13062C]">Todos os Programas</option>
              {programs.map((p) => (
                <option key={p.id} value={p.id} className="bg-[#13062C]">
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Cabin Class */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Classe de Cabine
            </label>
            <select
              value={cabinClass}
              onChange={(e) => setCabinClass(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-purple-800/80 rounded-lg bg-[#1A0B3B] text-white focus:ring-2 focus:ring-[#22C55E] focus:outline-hidden"
            >
              <option value="all" className="bg-[#13062C]">Todas as Cabines</option>
              <option value="economy" className="bg-[#13062C]">Classe Econômica</option>
              <option value="premium_economy" className="bg-[#13062C]">Premium Economy</option>
              <option value="business" className="bg-[#13062C]">Classe Executiva</option>
            </select>
          </div>

          {/* Mês de Partida Integrado */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Mês de Partida
            </label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-purple-800/80 rounded-lg bg-[#1A0B3B] text-white focus:ring-2 focus:ring-[#22C55E] focus:outline-hidden"
            >
              <option value="all" className="bg-[#13062C]">Qualquer Mês (Todos)</option>
              {availableMonths.map((m) => (
                <option key={m.key} value={m.key} className="bg-[#13062C] capitalize">
                  {m.label} ({m.count} voos)
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Row 3: Max Miles Slider & Sort */}
        <div className="pt-2 border-t border-purple-900/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex-1 max-w-md">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-semibold text-slate-300">Teto Máximo de Milhas:</span>
              <span className="font-bold text-[#22C55E] font-mono tabular-nums">
                até {maxMiles.toLocaleString('pt-BR')} milhas
              </span>
            </div>
            <input
              type="range"
              min={10000}
              max={150000}
              step={5000}
              value={maxMiles}
              onChange={(e) => setMaxMiles(Number(e.target.value))}
              className="w-full accent-[#22C55E] cursor-pointer"
            />
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-slate-400">Ordenar por:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-2.5 py-1.5 text-xs font-semibold border border-purple-800/80 rounded-lg bg-[#1A0B3B] text-white focus:ring-2 focus:ring-[#22C55E]"
              >
                <option value="miles_asc" className="bg-[#13062C]">Menor valor em milhas</option>
                <option value="cash_asc" className="bg-[#13062C]">Menor taxa em reais</option>
                <option value="verified_desc" className="bg-[#13062C]">Verificação mais recente</option>
                <option value="date_desc" className="bg-[#13062C]">Data do voo</option>
              </select>
            </div>

            <button
              onClick={handleResetFilters}
              title="Redefinir filtros"
              className="p-1.5 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Feed Results Header */}
      <div className="flex items-center justify-between text-xs text-slate-400 px-1">
        <span>
          {viewMode === 'routes' ? (
            <>Exibindo <strong className="text-white tabular-nums">{groupedRoutes.length}</strong> rotas agrupadas com múltiplas datas</>
          ) : (
            <>Exibindo <strong className="text-white tabular-nums">{filteredOffers.length}</strong> oportunidades verificadas</>
          )}
        </span>
        <span className="text-[#38BDF8]">Atualizações automáticas de radar</span>
      </div>

      {/* VIEW MODE 1: Grouped Routes Multi-Month View */}
      {viewMode === 'routes' && (
        <div className="space-y-4">
          {groupedRoutes.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-[#13062C] border border-purple-900/60">
              <Plane className="w-10 h-10 text-slate-500 mx-auto mb-2" />
              <h3 className="text-sm font-bold text-white">Nenhuma rota encontrada para os filtros aplicados</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 mb-4">
                Tente redefinir os filtros ou alterar a cidade de destino.
              </p>
              <button
                onClick={handleResetFilters}
                className="px-4 py-2 text-xs font-bold text-slate-950 bg-[#22C55E] hover:bg-emerald-400 rounded-lg transition-colors"
              >
                Redefinir Filtros
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {groupedRoutes.map(group => {
                const prog = programs.find(p => p.id === group.programId);
                const totalDates = group.offers.length;

                return (
                  <div
                    key={group.routeKey}
                    className="p-4 sm:p-5 rounded-2xl bg-[#13062C] border border-purple-900/60 hover:border-purple-700 transition-all flex flex-col justify-between shadow-lg"
                  >
                    <div>
                      {/* Top Header */}
                      <div className="flex flex-wrap items-center justify-between text-xs gap-2 mb-3">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: prog?.color || '#38BDF8' }}
                          />
                          <span className="font-bold text-white">
                            {group.airline} · {prog?.name}
                          </span>
                        </div>

                        <span className="text-[11px] font-bold text-[#22C55E] bg-[#22C55E]/15 border border-[#22C55E]/30 px-2 py-0.5 rounded-full">
                          {totalDates} {totalDates === 1 ? 'data disponível' : 'datas disponíveis'}
                        </span>
                      </div>

                      {/* PRD 4.3 Predictive Badge Indicator */}
                      {(() => {
                        const insight = calculateRouteTrendInsights(group.offers[0], offers, observations);
                        const isBuyNow = insight.action === 'BUY_NOW';
                        return (
                          <div className="mb-2.5 flex items-center justify-between text-xs px-2.5 py-1.5 rounded-xl bg-[#0D021F] border border-purple-900/60">
                            <div className="flex items-center gap-1.5">
                              <span className={`w-2 h-2 rounded-full ${isBuyNow ? 'bg-[#22C55E] animate-pulse' : 'bg-amber-400'}`} />
                              <span className="font-bold text-white text-[11px]">
                                {isBuyNow ? 'Comprar agora' : 'Melhor esperar'}
                              </span>
                              <span className="text-slate-500 text-[10px]">· {insight.confidenceScore}% de confiança</span>
                            </div>
                            <span className={`text-[10px] font-semibold ${isBuyNow ? 'text-emerald-300' : 'text-amber-300'}`}>
                              {isBuyNow ? (insight.percentFromLowest === 0 ? 'O menor de todos' : `+${insight.percentFromLowest}% do menor`) : 'Preço deve cair'}
                            </span>
                          </div>
                        );
                      })()}

                      {/* Route Banner */}
                      <div className="flex items-center justify-between gap-3 my-2 p-2.5 sm:p-3 rounded-xl bg-[#180838]/80 border border-purple-800/40">
                        <div>
                          <div className="text-xl sm:text-2xl font-black text-white font-mono tracking-tight">
                            {group.origin}
                          </div>
                          <div className="text-xs text-slate-300 truncate max-w-[90px] sm:max-w-none">
                            {group.originCity}
                          </div>
                        </div>

                        <div className="flex-1 flex flex-col items-center px-2 sm:px-3">
                          <div className="w-full flex items-center justify-center">
                            <div className="h-px bg-purple-700 flex-1" />
                            <Plane className="w-4 h-4 text-[#38BDF8] mx-2 shrink-0" />
                            <div className="h-px bg-purple-700 flex-1" />
                          </div>
                          <span className="text-[10px] text-cyan-300 mt-1 whitespace-nowrap">
                            {group.monthsList.length} {group.monthsList.length === 1 ? 'mês com voos' : 'meses com voos'}
                          </span>
                        </div>

                        <div className="text-right">
                          <div className="text-xl sm:text-2xl font-black text-white font-mono tracking-tight">
                            {group.destination}
                          </div>
                          <div className="text-xs text-slate-300 truncate max-w-[90px] sm:max-w-none">
                            {group.destCity}
                          </div>
                        </div>
                      </div>

                      {/* Resumo da Oportunidade: Período e Disponibilidade Elegantes */}
                      <div className="mt-3 p-2.5 sm:p-3 rounded-xl bg-[#0F0324] border border-purple-900/60 flex items-center justify-between text-xs gap-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-8 h-8 rounded-lg bg-purple-950/80 border border-purple-800/60 flex items-center justify-center text-[#38BDF8] shrink-0">
                            <Calendar className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <span className="text-[11px] font-bold text-white block truncate">
                              Datas em {group.monthsList.map(m => m.label).join(' e ')}
                            </span>
                            <span className="text-[10px] text-slate-400 block truncate">
                              {totalDates} {totalDates === 1 ? 'data tarifada encontrada' : 'datas tarifadas encontradas'}
                            </span>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold text-[#38BDF8] bg-cyan-950/40 border border-cyan-800/50 px-2 py-0.5 rounded-full shrink-0">
                          {group.airline}
                        </span>
                      </div>

                      {/* BOTÃO QUE GERA URGÊNCIA: "X assentos disponíveis" com estilo chamativo */}
                      {(() => {
                        const lowestOffer = group.offers[0];
                        const seats = lowestOffer.seatsLeft ?? 4;
                        const isCritical = seats <= 3;
                        return (
                          <button
                            type="button"
                            onClick={() => setSelectedOffer(lowestOffer)}
                            className={`w-full mt-2.5 p-2.5 sm:p-3 rounded-xl border text-left transition-all flex items-center justify-between gap-2.5 shadow-md cursor-pointer group/urg ${
                              isCritical
                                ? 'bg-gradient-to-r from-rose-950/70 via-[#2B0B2E] to-[#1E083E] border-rose-500/60 hover:border-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.25)]'
                                : 'bg-gradient-to-r from-amber-950/60 via-[#260C2E] to-[#180838] border-amber-500/50 hover:border-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.15)]'
                            }`}
                            title="Clique para ir para a tela de dados, datas, companhia aérea e emitir"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className={`p-1.5 sm:p-2 rounded-lg shrink-0 ${
                                isCritical ? 'bg-rose-500/25 text-rose-400 animate-pulse' : 'bg-amber-500/25 text-amber-400'
                              }`}>
                                <Flame className="w-4 h-4 fill-current" />
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className={`text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded shrink-0 ${
                                    isCritical ? 'bg-rose-600 text-white' : 'bg-amber-500 text-slate-950'
                                  }`}>
                                    {isCritical ? 'ALERTA DE ESCASSEZ' : 'VAGAS LIMITADAS'}
                                  </span>
                                  <span className="text-xs font-black text-white">
                                    {seats <= 1
                                      ? 'Apenas 1 assento disponível!'
                                      : `Apenas ${seats} assentos disponíveis!`}
                                  </span>
                                </div>
                                <p className="text-[11px] text-slate-300 mt-0.5 truncate">
                                  Clique para selecionar data, conferir companhia ({group.airline}) e emitir
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-1 text-xs font-black text-[#22C55E] group-hover/urg:translate-x-1 transition-transform shrink-0">
                              <span className="hidden sm:inline">Ver Dados</span>
                              <ChevronRight className="w-4 h-4 stroke-[3]" />
                            </div>
                          </button>
                        );
                      })()}
                    </div>

                    {/* Footer Row with Lowest Price & Action */}
                    <div className="mt-4 pt-3 border-t border-purple-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-baseline justify-between sm:block">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">A partir de</span>
                        <div className="text-2xl font-black text-white font-mono tabular-nums tracking-tight">
                          {group.lowestMiles.toLocaleString('pt-BR')}
                          <span className="text-xs font-sans text-[#22C55E] ml-1 uppercase">
                            {prog?.unitLabel || 'pts'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <button
                          type="button"
                          onClick={() => openPushModalForRoute(group.origin, group.destination, group.lowestMiles)}
                          className={`p-2.5 sm:px-3 sm:py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shrink-0 ${
                            savedSearches.some(
                              s => s.isActive &&
                              s.origin.toUpperCase() === group.origin.toUpperCase() &&
                              s.destination.toUpperCase() === group.destination.toUpperCase()
                            )
                              ? 'bg-emerald-500/20 text-[#22C55E] border border-emerald-500/40 hover:bg-emerald-500/30 shadow-[0_0_10px_rgba(34,197,94,0.2)]'
                              : 'bg-[#180838] hover:bg-purple-900/60 border border-purple-800/80 text-slate-300 hover:text-white'
                          }`}
                          title="Gerenciar canais de alerta (Push, WhatsApp, E-mail) para esta rota"
                        >
                          <BellRing className={`w-3.5 h-3.5 ${
                            savedSearches.some(
                              s => s.isActive && s.pushEnabled !== false &&
                              s.origin.toUpperCase() === group.origin.toUpperCase() &&
                              s.destination.toUpperCase() === group.destination.toUpperCase()
                            ) ? 'fill-[#22C55E]' : ''
                          }`} />
                          <span className="hidden sm:inline">
                            {savedSearches.some(
                              s => s.isActive &&
                              s.origin.toUpperCase() === group.origin.toUpperCase() &&
                              s.destination.toUpperCase() === group.destination.toUpperCase()
                            ) ? 'Canais de Alerta' : 'Ativar Alerta'}
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setSelectedOffer(group.offers[0])}
                          className="flex-1 sm:flex-initial px-4 py-2.5 sm:py-2 rounded-xl text-xs font-black text-slate-950 bg-[#22C55E] hover:bg-emerald-400 transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(34,197,94,0.35)] transform hover:scale-[1.02] cursor-pointer"
                        >
                          <span>Ver Oportunidade & Datas</span>
                          <ChevronRight className="w-3.5 h-3.5 stroke-[3]" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* VIEW MODE 2: Individual Offers Cards Grid */}
      {viewMode === 'cards' && (
        <>
          {filteredOffers.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-[#13062C] border border-purple-900/60">
              <Plane className="w-10 h-10 text-slate-500 mx-auto mb-2" />
              <h3 className="text-sm font-bold text-white">Nenhuma oferta encontrada para os filtros aplicados</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 mb-4">
                Tente elevar o teto de milhas ou selecionar 'Qualquer Mês' para conferir opções disponíveis.
              </p>
              <button
                onClick={handleResetFilters}
                className="px-4 py-2 text-xs font-bold text-slate-950 bg-[#22C55E] hover:bg-emerald-400 rounded-lg transition-colors"
              >
                Redefinir Todos os Filtros
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredOffers.map((offer) => {
                const prog = programs.find(p => p.id === offer.programId);
                const isExecutiva = offer.cabinClass === 'business';
                const totalRouteDates = getRouteOfferCount(offer.origin, offer.destination);
                const otherDatesCount = totalRouteDates - 1;

                return (
                  <div
                    key={offer.id}
                    onClick={() => setSelectedOffer(offer)}
                    className={`group p-4 sm:p-5 rounded-2xl bg-[#13062C] border transition-all cursor-pointer hover:shadow-xl flex flex-col justify-between ${
                      isExecutiva
                        ? 'border-purple-600/60 hover:border-[#38BDF8] shadow-[0_0_15px_rgba(56,189,248,0.1)]'
                        : 'border-purple-900/60 hover:border-[#22C55E]/60'
                    }`}
                  >
                    <div>
                      {/* Top program & verification metadata */}
                      <div className="flex flex-wrap items-center justify-between text-xs gap-2 mb-3">
                        <div className="flex items-center gap-1.5">
                          <span
                            className="w-2 h-2 rounded-full shrink-0"
                            style={{ backgroundColor: prog?.color || '#666' }}
                          />
                          <span className="font-bold text-slate-200">
                            {prog?.name}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-1.5 justify-end">
                          <div className="flex items-center gap-1 text-[11px] text-[#22C55E] font-semibold">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>{offer.availabilityStatus}</span>
                          </div>

                          {/* Termômetro de Milhas Pill */}
                          {(() => {
                            const deal = evaluateDeal(offer.programId, offer.cabinClass, offer.miles, offer.destination);
                            return (
                              <span
                                className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border flex items-center gap-1 ${deal.badgeBg}`}
                                title={deal.description}
                              >
                                {deal.emoji && <span>{deal.emoji}</span>}
                                <span>{deal.label}</span>
                              </span>
                            );
                          })()}

                          {/* PRD 4.3 Predictive Pill */}
                          {(() => {
                            const insight = calculateRouteTrendInsights(offer, offers, observations);
                            const isBuyNow = insight.action === 'BUY_NOW';
                            return (
                              <span
                                className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                                  isBuyNow
                                    ? 'bg-emerald-500/20 text-[#22C55E] border border-emerald-500/40'
                                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                }`}
                                title={isBuyNow ? 'Comprar agora' : 'Melhor esperar'}
                              >
                                <span className={`w-1.5 h-1.5 rounded-full ${isBuyNow ? 'bg-[#22C55E] animate-pulse' : 'bg-amber-400'}`} />
                                <span>{isBuyNow ? 'Comprar agora' : 'Esperar'}</span>
                              </span>
                            );
                          })()}

                          {/* Quick Push Route Action Button */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              openPushModalForRoute(offer.origin, offer.destination, offer.miles);
                            }}
                            className={`p-1 rounded-md border transition-all ${
                              savedSearches.some(
                                s => s.isActive && s.pushEnabled !== false &&
                                s.origin.toUpperCase() === offer.origin.toUpperCase() &&
                                s.destination.toUpperCase() === offer.destination.toUpperCase()
                              )
                                ? 'text-[#22C55E] bg-emerald-500/15 border-emerald-500/30 hover:bg-emerald-500/25 shadow-xs'
                                : 'text-slate-400 border-purple-800/60 hover:text-white hover:border-[#38BDF8] bg-[#180838]'
                            }`}
                            title={
                              savedSearches.some(
                                s => s.isActive && s.pushEnabled !== false &&
                                s.origin.toUpperCase() === offer.origin.toUpperCase() &&
                                s.destination.toUpperCase() === offer.destination.toUpperCase()
                              )
                                ? 'Push ativo para esta rota (clique para gerenciar)'
                                : 'Ativar alerta Push para esta rota'
                            }
                          >
                            <BellRing className={`w-3.5 h-3.5 ${
                              savedSearches.some(
                                s => s.isActive && s.pushEnabled !== false &&
                                s.origin.toUpperCase() === offer.origin.toUpperCase() &&
                                s.destination.toUpperCase() === offer.destination.toUpperCase()
                              ) ? 'fill-[#22C55E]' : ''
                            }`} />
                          </button>
                        </div>
                      </div>

                      {/* Route & City Names */}
                      <div className="flex items-center justify-between gap-3 my-2">
                        <div>
                          <div className="text-xl font-black text-white font-mono tracking-tight">
                            {offer.origin}
                          </div>
                          <div className="text-[11px] text-slate-400 truncate max-w-[120px]">
                            {offer.originCity}
                          </div>
                        </div>

                        <div className="flex-1 flex flex-col items-center px-2">
                          <span className="text-[10px] text-slate-400 whitespace-nowrap">
                            {offer.stops === 0 ? 'Direto' : `${offer.stops} parada`}
                          </span>
                          <div className="w-full flex items-center justify-center">
                            <div className="h-px bg-purple-900 flex-1" />
                            <Plane className="w-3 h-3 text-[#38BDF8] mx-1 shrink-0" />
                            <div className="h-px bg-purple-900 flex-1" />
                          </div>
                          <span className="text-[10px] text-slate-400 capitalize">
                            {offer.tripType === 'round_trip' ? 'Ida e Volta' : 'Só Ida'}
                          </span>
                        </div>

                        <div className="text-right">
                          <div className="text-xl font-black text-white font-mono tracking-tight">
                            {offer.destination}
                          </div>
                          <div className="text-[11px] text-slate-400 truncate max-w-[120px]">
                            {offer.destCity}
                          </div>
                        </div>
                      </div>

                      {/* Airline & Cabin note */}
                      <div className="flex items-center justify-between text-xs text-slate-400 mt-3 pt-2.5 border-t border-purple-900/40">
                        <span className="truncate">{offer.airline}</span>
                        <span className={`text-[11px] font-semibold ${isExecutiva ? 'text-[#38BDF8]' : 'text-slate-300'}`}>
                          {offer.cabinClass === 'business'
                            ? 'Executiva'
                            : offer.cabinClass === 'premium_economy'
                            ? 'Premium Eco'
                            : 'Econômica'}
                        </span>
                      </div>

                      {/* Departure date */}
                      <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-500" />
                        <span>Ida: {formatDate(offer.departureDate)}</span>
                        {offer.returnDate && (
                          <span>· Volta: {formatDate(offer.returnDate)}</span>
                        )}
                      </div>

                      {/* Multi-Date Availability on this Route Banner */}
                      {otherDatesCount > 0 && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenCalendar(`${offer.origin}-${offer.destination}`, offer);
                          }}
                          className="mt-2.5 w-full py-1.5 px-2.5 rounded-lg bg-[#180838] hover:bg-[#200A4C] border border-purple-800/60 text-[#38BDF8] text-[11px] font-semibold flex items-center justify-between transition-colors group/cal"
                        >
                          <span className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-[#38BDF8]" />
                            <span>+{otherDatesCount} datas nesta rota</span>
                          </span>
                          <span className="text-[#22C55E] text-[10px] font-bold group-hover/cal:translate-x-0.5 transition-transform flex items-center gap-0.5">
                            Ver Calendário <ChevronRight className="w-3 h-3" />
                          </span>
                        </button>
                      )}
                    </div>

                    {/* Indicador de Escassez e Urgência no Card */}
                    <div className={`mt-2.5 p-2 rounded-xl border flex items-center justify-between text-xs ${
                      (offer.seatsLeft ?? 4) <= 3
                        ? 'bg-rose-950/40 border-rose-500/50 text-rose-300'
                        : 'bg-amber-950/30 border-amber-500/40 text-amber-300'
                    }`}>
                      <span className="flex items-center gap-1.5 font-black text-[11px]">
                        <Flame className={`w-3.5 h-3.5 fill-current ${(offer.seatsLeft ?? 4) <= 3 ? 'text-rose-400 animate-pulse' : 'text-amber-400'}`} />
                        <span>
                          {(offer.seatsLeft ?? 4) <= 1
                            ? 'Apenas 1 assento disponível nesta tarifa!'
                            : `Apenas ${offer.seatsLeft ?? 4} assentos disponíveis nesta tarifa!`}
                        </span>
                      </span>
                      <span className="text-[10px] text-slate-300 font-semibold">
                        {offer.airline}
                      </span>
                    </div>

                    {/* Price & CTA Footer */}
                    <div className="mt-3 pt-2.5 border-t border-purple-900/40 flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Tarifa em milhas</span>
                        <div className="flex items-baseline gap-1">
                          <span className="text-xl font-black text-white font-mono tabular-nums">
                            {offer.miles.toLocaleString('pt-BR')}
                          </span>
                          <span className="text-[10px] text-[#22C55E] uppercase font-bold">
                            {prog?.unitLabel || 'pts'}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400">
                          + R$ {offer.cashAmount.toFixed(2)} taxas
                        </div>
                        {(() => {
                          const econo = analyzeOfferEconomilha(offer.programId, offer.cabinClass, offer.miles, offer.cashAmount, offer.origin, offer.destination);
                          if (econo.savedPercent <= 0) return null;
                          return (
                            <div className="mt-1 flex items-center gap-1 text-[10px] text-emerald-400 font-bold truncate">
                              <TrendingDown className="w-3 h-3 text-[#22C55E] shrink-0" />
                              <span className="truncate">{econo.savedPercent}% OFF vs Dinheiro</span>
                            </div>
                          );
                        })()}
                      </div>
                      <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-black text-slate-950 bg-[#22C55E] group-hover:bg-emerald-400 transition-all shadow-sm shrink-0">
                        <span>Ver Oportunidade</span>
                        <ChevronRight className="w-3.5 h-3.5 stroke-[3] group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </div>
                    <div className="mt-2 text-[10px] text-slate-500 flex items-center justify-between">
                      <span className="flex items-center gap-1 text-emerald-400/90 font-medium">
                        <Sparkles className="w-2.5 h-2.5" /> Sincronizado em tempo real
                      </span>
                      <span>{formatRelativeTime(offer.verifiedAt)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Offer Detail Modal */}
      <ErrorBoundary fallbackTitle="Não foi possível carregar os detalhes desta oferta">
        <OfferDetailModal
          offer={selectedOffer}
          onClose={() => setSelectedOffer(null)}
          onOpenCreateAlert={(off) => {
            onOpenCreateAlertForRoute(off.origin, off.destination, off.miles + 5000, off.programId);
          }}
          onSelectAlternativeOffer={(altOffer) => {
            setSelectedOffer(altOffer);
          }}
          onOpenRouteCalendar={(rKey, off) => {
            handleOpenCalendar(rKey, off);
          }}
        />
      </ErrorBoundary>

      {/* Multi-Month Route Calendar Modal */}
      <RouteCalendarModal
        isOpen={isCalendarOpen}
        onClose={() => setIsCalendarOpen(false)}
        routeKey={calendarRouteKey}
        initialOffer={calendarInitialOffer}
        onOpenCreateAlert={(off) => {
          setIsCalendarOpen(false);
          onOpenCreateAlertForRoute(off.origin, off.destination, off.miles + 5000, off.programId);
        }}
      />
    </div>
  );
};

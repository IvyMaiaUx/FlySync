import React, { useMemo } from 'react';
import { useFlySync } from '../../store/FlySyncContext';
import { FlightOffer } from '../../types';
import { Search, Calculator, Bell, Wallet, Sparkles, Plane, ArrowRight, Tag, Flame, Info, ChevronRight, MapPin } from 'lucide-react';
import { getDestinationImageUrl } from '../../data/destinationImages';

interface HomeViewProps {
  onNavigate: (tab: string) => void;
  onSelectOffer: (offer: FlightOffer) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ onNavigate, onSelectOffer }) => {
  const { offers, balances, programs, campaigns, user } = useFlySync();

  // Formatted date: "quinta-feira, 15 de outubro"
  const formattedDate = useMemo(() => {
    return new Date().toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    });
  }, []);

  // Total consolidated miles
  const totalBalance = useMemo(() => {
    const sum = balances.reduce((acc, b) => acc + (b.balance || 0), 0);
    return sum > 0 ? sum : 284500;
  }, [balances]);

  // Program balances breakdown
  const programBalances = useMemo(() => {
    if (balances.length > 0) {
      return balances.map(b => {
        const prog = programs.find(p => p.id === b.programId);
        return {
          id: b.programId,
          name: prog?.name || b.programId,
          balance: b.balance,
          color: prog?.color || '#38BDF8',
          percent: totalBalance > 0 ? Math.round((b.balance / totalBalance) * 100) : 0
        };
      });
    }
    // Fallback demo breakdown mirroring prototype
    return [
      { id: 'latam', name: 'LATAM Pass', balance: 142000, color: '#e11d48', percent: 50 },
      { id: 'smiles', name: 'Smiles (GOL)', balance: 84500, color: '#f97316', percent: 30 },
      { id: 'azul', name: 'Azul Fidelidade', balance: 38000, color: '#0284c7', percent: 13 },
      { id: 'livelo', name: 'Livelo', balance: 20000, color: '#9333ea', percent: 7 }
    ];
  }, [balances, programs, totalBalance]);

  // Featured top offers for "Ofertas de hoje" with high-appeal destinations (Miami, Santiago, Lisboa, Paris, Buenos Aires, Orlando, Bariloche, etc.)
  const todayOffers = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const valid = offers.filter(o => o.status === 'ativa' && o.departureDate >= todayStr);
    
    const highlightDests = ['MIA', 'SCL', 'LIS', 'EZE', 'CDG', 'MCO', 'MAD', 'CUN', 'BRC', 'GIG', 'REC', 'SSA', 'JFK', 'DXB'];
    const highlighted = valid.filter(o => highlightDests.includes(o.destination.toUpperCase()));
    const others = valid.filter(o => !highlightDests.includes(o.destination.toUpperCase()));
    
    // Pick unique destination pairs to avoid duplicates in the top carousel
    const seenRoutes = new Set<string>();
    const uniqueList: FlightOffer[] = [];
    
    for (const off of [...highlighted, ...others]) {
      const key = `${off.origin}-${off.destination}`;
      if (!seenRoutes.has(key)) {
        seenRoutes.add(key);
        uniqueList.push(off);
      }
      if (uniqueList.length >= 10) break;
    }
    
    return uniqueList;
  }, [offers]);

  // Featured active campaign
  const featuredCampaign = useMemo(() => {
    return campaigns.find(c => c.isActive) || {
      id: 'cmp-feat',
      title: 'Transferência com até 80% de bônus',
      sourceProgramName: 'Livelo',
      targetProgramName: 'Smiles',
      bonusPercentage: 80,
      endDate: '2026-10-16',
      description: 'Válido até 16 de out. de 2026, a partir de 10.000 pontos.'
    };
  }, [campaigns]);

  return (
    <div className="space-y-7 animate-fade-in pb-16">
      {/* Date Header */}
      <div>
        <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#9d98b0] block mb-1">
          {formattedDate}
        </span>
        <h1 className="text-3xl sm:text-4xl lg:text-[42px] font-extrabold tracking-tight text-white leading-tight">
          Suas milhas,{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#5ef0b4] to-[#7ab8ff]">
            em um só lugar
          </span>
        </h1>
        <p className="text-sm text-[#9d98b0] mt-1.5 leading-relaxed">
          Saldo consolidado, ofertas do radar e campanhas que valem a pena agora.
        </p>
      </div>

      {/* Consolidated Balance Card (Mockup .bal) */}
      <div className="relative overflow-hidden rounded-[24px] p-6 sm:p-7 bg-gradient-to-br from-[#1a1433] via-[#120a28] to-[#0c0919] border border-white/10 shadow-[0_24px_48px_-28px_#000,inset_0_1px_0_rgba(255,255,255,0.1)]">
        {/* Decorative background glow circles */}
        <div className="absolute -top-12 -right-12 w-44 h-44 rounded-full border border-white/10 shadow-[0_0_0_24px_rgba(255,255,255,0.02),0_0_0_48px_rgba(255,255,255,0.01)] pointer-events-none" />
        <div className="absolute top-0 right-1/4 w-36 h-36 bg-[#8b7cf6]/15 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#9d98b0]">
              Saldo consolidado
            </span>
            <span className="text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full bg-[#34d399]/15 text-[#6ee7b7] border border-[#34d399]/30">
              {programBalances.length} programas
            </span>
          </div>

          <div className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white font-mono tabular-nums my-3">
            {totalBalance.toLocaleString('pt-BR')}
            <span className="text-base sm:text-lg font-sans font-normal text-[#9d98b0] ml-2">
              milhas
            </span>
          </div>

          {/* Multi-segment balance distribution bar */}
          <div className="h-2 rounded-full bg-white/10 overflow-hidden flex my-3.5 shadow-inner">
            {programBalances.map(p => (
              <div
                key={p.id}
                className="h-full transition-all duration-500 first:rounded-l-full last:rounded-r-full"
                style={{ width: `${Math.max(4, p.percent)}%`, backgroundColor: p.color }}
                title={`${p.name}: ${p.balance.toLocaleString('pt-BR')} (${p.percent}%)`}
              />
            ))}
          </div>

          {/* Program legends */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-[#9d98b0] pt-1">
            {programBalances.map(p => (
              <div key={p.id} className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: p.color }} />
                <span className="text-slate-200 font-medium">{p.name}:</span>
                <span className="font-mono tabular-nums font-semibold text-white">
                  {p.balance.toLocaleString('pt-BR')}
                </span>
              </div>
            ))}
          </div>

          {/* Warning / Expiring Miles Alert */}
          <div className="mt-4 flex items-center gap-2 px-3 py-2.5 rounded-xl bg-[#fbbf24]/10 border border-[#fbbf24]/30 text-[#fbbf24] text-xs">
            <Info className="w-4 h-4 shrink-0 text-[#f5b84b]" />
            <span className="leading-snug">
              <strong>12.400 milhas</strong> expiram nos próximos 60 dias (LATAM Pass). Aproveite as emissões do radar!
            </span>
          </div>
        </div>
      </div>

      {/* Quick Actions (4-Column Grid: Buscar, Simulador, Alertas, Carteira) */}
      <div className="grid grid-cols-4 gap-2.5 sm:gap-3">
        <button
          type="button"
          onClick={() => onNavigate('search')}
          className="group flex flex-col items-center text-center focus:outline-hidden cursor-pointer"
        >
          <div className="w-full h-14 sm:h-16 rounded-[18px] bg-[#110d1d] hover:bg-[#181328] border border-white/8 hover:border-[#8b7cf6]/50 flex items-center justify-center text-[#8b7cf6] transition-all shadow-sm group-hover:scale-[1.02]">
            <Search className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2]" />
          </div>
          <strong className="text-xs font-semibold text-slate-200 mt-2 block">
            Buscar
          </strong>
        </button>

        <button
          type="button"
          onClick={() => onNavigate('campaigns')}
          className="group flex flex-col items-center text-center focus:outline-hidden cursor-pointer"
        >
          <div className="w-full h-14 sm:h-16 rounded-[18px] bg-[#110d1d] hover:bg-[#181328] border border-white/8 hover:border-[#34d399]/50 flex items-center justify-center text-[#34d399] transition-all shadow-sm group-hover:scale-[1.02]">
            <Calculator className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2]" />
          </div>
          <strong className="text-xs font-semibold text-slate-200 mt-2 block">
            Simulador
          </strong>
        </button>

        <button
          type="button"
          onClick={() => onNavigate('alerts')}
          className="group flex flex-col items-center text-center focus:outline-hidden cursor-pointer"
        >
          <div className="w-full h-14 sm:h-16 rounded-[18px] bg-[#110d1d] hover:bg-[#181328] border border-white/8 hover:border-[#5eb8ff]/50 flex items-center justify-center text-[#5eb8ff] transition-all shadow-sm group-hover:scale-[1.02]">
            <Bell className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2]" />
          </div>
          <strong className="text-xs font-semibold text-slate-200 mt-2 block">
            Alertas
          </strong>
        </button>

        <button
          type="button"
          onClick={() => onNavigate('wallet')}
          className="group flex flex-col items-center text-center focus:outline-hidden cursor-pointer"
        >
          <div className="w-full h-14 sm:h-16 rounded-[18px] bg-[#110d1d] hover:bg-[#181328] border border-white/8 hover:border-[#f5b84b]/50 flex items-center justify-center text-[#f5b84b] transition-all shadow-sm group-hover:scale-[1.02]">
            <Wallet className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2]" />
          </div>
          <strong className="text-xs font-semibold text-slate-200 mt-2 block">
            Carteira
          </strong>
        </button>
      </div>

      {/* Live Radar Carousel ("Ofertas de hoje") */}
      <div className="space-y-3.5">
        <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-[#6f6a84]">
          <span className="w-2.5 h-2.5 rounded-full bg-[#34d399] shadow-[0_0_0_3px_rgba(52,211,153,0.2)] animate-pulse" />
          <span>Radar ao vivo</span>
        </div>

        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Ofertas de hoje
            </h2>
            <p className="text-xs text-[#9d98b0] mt-0.5">
              Menores preços em milhas monitorados em tempo real
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('radar')}
            className="text-xs font-bold uppercase tracking-wider text-[#9d98b0] hover:text-white transition-colors cursor-pointer"
          >
            Ver todas →
          </button>
        </div>

        {/* Horizontal Carousel */}
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none snap-x">
          {todayOffers.map((offer, idx) => {
            const prog = programs.find(p => p.id === offer.programId);
            const isCash = offer.paymentType === 'cash';
            const priceLabel = isCash
              ? `R$ ${(offer.cashPriceTotal || offer.miles).toLocaleString('pt-BR')}`
              : `${offer.miles.toLocaleString('pt-BR')} milhas`;

            // Gradient backgrounds matching prototype
            const gradients = [
              'linear-gradient(160deg, #3b2a8f, #08060f)',
              'linear-gradient(160deg, #0f5c52, #08060f)',
              'linear-gradient(160deg, #1e4fa3, #08060f)',
              'linear-gradient(160deg, #6b2a86, #08060f)',
              'linear-gradient(160deg, #2b3a9e, #08060f)',
              'linear-gradient(160deg, #0e5f73, #08060f)'
            ];
            const bgGrad = gradients[idx % gradients.length];

            return (
              <button
                key={offer.id}
                type="button"
                onClick={() => onSelectOffer(offer)}
                className="flex-none w-[170px] sm:w-[190px] snap-start rounded-[20px] bg-[#110d1d] border border-white/8 hover:border-white/20 transition-all text-left overflow-hidden group cursor-pointer hover:-translate-y-1 shadow-md"
              >
                {/* Visual Header with Real Destination Photography */}
                <div className="relative h-36 p-3 flex flex-col justify-end overflow-hidden group/img">
                  <img
                    src={getDestinationImageUrl(offer.destination, offer.destCity)}
                    alt={offer.destCity}
                    loading="lazy"
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  {/* Dark gradient overlay for text readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#110d1d] via-[#110d1d]/40 to-black/30 pointer-events-none" />

                  {/* Top Badges */}
                  <span className="absolute top-2.5 left-2.5 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-black/75 backdrop-blur-md text-slate-100 border border-white/10 shadow-sm z-10">
                    {isCash ? 'Dinheiro' : 'Milhas'}
                  </span>

                  <span className="absolute top-2.5 right-2.5 text-[9px] font-black px-2 py-0.5 rounded-full bg-gradient-to-r from-[#3ee6a8] to-[#86efac] text-[#08060f] shadow-sm z-10">
                    OFERTA
                  </span>

                  <div className="relative z-10">
                    <strong className="text-lg font-black tracking-tight text-white block drop-shadow-md">
                      {offer.origin} → {offer.destination}
                    </strong>
                    <span className="text-[11px] text-slate-200 font-medium truncate block drop-shadow-sm">
                      {offer.destCity}
                    </span>
                  </div>
                </div>

                {/* Price Info */}
                <div className="p-3">
                  <small className="text-[9px] font-bold uppercase tracking-wider text-[#6f6a84] block">
                    {isCash ? 'Tarifa em dinheiro' : 'A partir de'}
                  </small>
                  <div className="text-base font-black tracking-tight text-white font-mono tabular-nums">
                    {priceLabel}
                  </div>
                  <small className="text-[10px] text-[#9d98b0] block mt-0.5 truncate">
                    {isCash
                      ? 'Total c/ taxas inclusas'
                      : `+ R$ ${offer.cashAmount.toFixed(2)} taxas · trecho`}
                  </small>
                  <div className="mt-2 pt-1.5 border-t border-white/6 flex items-center justify-between text-[10px] text-[#6ee7b7] font-semibold">
                    <span>{offer.airline}</span>
                    <ChevronRight className="w-3 h-3 text-slate-500 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </button>
            );
          })}

          {/* "Ver mais" Card at the end */}
          <button
            type="button"
            onClick={() => onNavigate('radar')}
            className="flex-none w-[150px] snap-start rounded-[20px] border border-dashed border-white/15 bg-white/[0.02] hover:bg-white/[0.05] transition-all flex flex-col items-center justify-center gap-2 p-4 text-xs font-bold text-slate-200 cursor-pointer"
          >
            <div className="w-10 h-10 rounded-full bg-[#110d1d] border border-white/10 flex items-center justify-center text-[#34d399]">
              <ArrowRight className="w-5 h-5" />
            </div>
            <span>Ver todas as ofertas</span>
          </button>
        </div>

        <button
          type="button"
          onClick={() => onNavigate('radar')}
          className="w-full min-h-[50px] rounded-2xl bg-gradient-to-r from-[#3ee6a8] to-[#2fd08a] hover:from-[#34d399] hover:to-[#22c55e] text-[#08060f] font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-[0_10px_28px_-12px_rgba(52,211,153,0.55)] cursor-pointer mt-2"
        >
          <span>Ver todas as ofertas do radar</span>
          <ArrowRight className="w-4 h-4 stroke-[2.5]" />
        </button>
      </div>

      {/* Bonus Campaign Highlight ("Termina em breve") */}
      <div className="space-y-3.5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Termina em breve
            </h2>
            <p className="text-xs text-[#9d98b0] mt-0.5">
              Campanhas de bônus em transferência
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('campaigns')}
            className="text-xs font-bold uppercase tracking-wider text-[#9d98b0] hover:text-white transition-colors cursor-pointer"
          >
            Ver todas →
          </button>
        </div>

        <div
          onClick={() => onNavigate('campaigns')}
          className="rounded-[22px] p-5 sm:p-6 bg-[#110d1d] hover:bg-[#151024] border border-white/10 hover:border-[#8b7cf6]/40 transition-all cursor-pointer shadow-md group"
        >
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#34d399]">
              {featuredCampaign.sourceProgramName} → {featuredCampaign.targetProgramName}
            </span>
            <span className="inline-flex items-center h-6 px-2.5 rounded-full text-[10px] font-bold uppercase tracking-wider border border-[#fbbf24]/40 bg-[#fbbf24]/10 text-[#f5b84b]">
              2 dias restantes
            </span>
          </div>

          <h3 className="text-lg sm:text-xl font-bold tracking-tight text-white group-hover:text-[#5ef0b4] transition-colors">
            {featuredCampaign.title}
          </h3>
          <p className="text-xs text-[#9d98b0] mt-1.5 leading-relaxed">
            {featuredCampaign.description}
          </p>

          <div className="mt-4 pt-3 border-t border-white/6 flex items-center justify-between text-xs font-bold text-[#8b7cf6]">
            <span>Calcular no Simulador</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>
    </div>
  );
};

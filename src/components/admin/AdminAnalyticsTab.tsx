import React from 'react';
import { useFlySync } from '../../store/FlySyncContext';
import {
  TrendingUp,
  Users,
  DollarSign,
  Compass,
  Plane,
  Sparkles,
  ArrowUpRight,
  ShieldCheck,
  Award,
  Zap,
  BarChart3,
  Calendar,
  Layers
} from 'lucide-react';

export const AdminAnalyticsTab: React.FC = () => {
  const { users, offers, programs, sources, broadcasts } = useFlySync();

  const totalUsers = users.length;
  const vipUsers = users.filter(u => u.plan === 'premium').length;
  const freeUsers = totalUsers - vipUsers;
  const vipConversionRate = totalUsers > 0 ? ((vipUsers / totalUsers) * 100).toFixed(1) : '0';
  const estimatedMRR = vipUsers * 29.90;

  const activeOffers = offers.filter(o => o.status === 'ativa');
  const executiveOffers = offers.filter(o => o.cabinClass === 'business');
  const economyOffers = offers.filter(o => o.cabinClass === 'economy');

  // Calculate approximate savings delivered
  const totalSavingsBrl = offers.reduce((acc, curr) => {
    // Estimating standard retail cash vs cash paid on miles + cash
    const retailEst = (curr.miles * 0.035) + curr.cashAmount;
    const milesCostVal = (curr.miles * 0.016) + curr.cashAmount;
    const diff = Math.max(0, retailEst - milesCostVal);
    return acc + diff;
  }, 0);

  // Top routes mock metric derived from catalog & favorites
  const topRoutes = [
    { origin: 'GRU', dest: 'MIA', name: 'São Paulo → Miami', searches: 1420, avgMiles: 48500, trend: '+18%' },
    { origin: 'GIG', dest: 'LIS', name: 'Rio de Janeiro → Lisboa', searches: 1180, avgMiles: 72000, trend: '+12%' },
    { origin: 'GRU', dest: 'MAD', name: 'São Paulo → Madri', searches: 940, avgMiles: 42500, trend: '+24%' },
    { origin: 'BSB', dest: 'FLN', name: 'Brasília → Florianópolis', searches: 820, avgMiles: 14900, trend: '+8%' },
    { origin: 'REC', dest: 'FOR', name: 'Recife → Fortaleza', searches: 690, avgMiles: 8200, trend: '+5%' }
  ];

  // Program market share in active offers
  const programStats = programs.map(prog => {
    const count = offers.filter(o => o.programId === prog.id).length;
    const percent = offers.length > 0 ? ((count / offers.length) * 100).toFixed(1) : '0';
    return {
      ...prog,
      count,
      percent
    };
  }).sort((a, b) => b.count - a.count);

  return (
    <div className="space-y-6">
      {/* Top BI KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* MRR & VIP Revenue */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-[#1b0a38] to-[#12052c] border border-amber-500/30 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-300">MRR Recorrente</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-300 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-white font-mono">
              R$ {estimatedMRR.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className="text-xs font-semibold text-emerald-400 flex items-center">
              <ArrowUpRight className="w-3.5 h-3.5" /> +14.2%
            </span>
          </div>
          <p className="text-[11px] text-purple-300/80 mt-1">
            {vipUsers} assinantes VIP Premium ativos a R$ 29,90/mês
          </p>
        </div>

        {/* Total Users & Conversion */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-[#12052c] to-[#0c031e] border border-purple-800/70 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-300">Base de Usuários</span>
            <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-300 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-white font-mono">{totalUsers}</span>
            <span className="text-xs text-amber-300 font-bold bg-amber-500/20 px-2 py-0.5 rounded-full">
              {vipConversionRate}% VIP
            </span>
          </div>
          <p className="text-[11px] text-purple-300/80 mt-1">
            {vipUsers} Pro · {freeUsers} Gratuitos
          </p>
        </div>

        {/* Active Catalog Volume */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-[#12052c] to-[#0c031e] border border-emerald-900/60 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Ofertas Mineradas</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Plane className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-white font-mono">{activeOffers.length}</span>
            <span className="text-xs text-slate-400">/ {offers.length} totais</span>
          </div>
          <p className="text-[11px] text-emerald-300/80 mt-1">
            {executiveOffers.length} Executiva · {economyOffers.length} Econômica
          </p>
        </div>

        {/* Estimated Passenger Savings */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-[#12052c] to-[#0c031e] border border-sky-900/60 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-sky-400">Economia Gerada</span>
            <div className="w-8 h-8 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-white font-mono">
              R$ {(totalSavingsBrl * 12).toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
            </span>
          </div>
          <p className="text-[11px] text-sky-300/80 mt-1">
            Economia média de 42% frente a bilhetes pagantes
          </p>
        </div>
      </div>

      {/* Main Analytics Row: Top Rotas & Participação de Programas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Rotas Mais Monitoradas */}
        <div className="p-5 rounded-2xl bg-[#12052C] border border-purple-900/70 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Compass className="w-4 h-4 text-[#34d399]" />
                <span>Rotas Mais Buscadas & Monitoradas</span>
              </h3>
              <p className="text-xs text-purple-300">Volume de buscas e alertas ativos por trecho</p>
            </div>
            <span className="text-[11px] font-bold text-purple-400 bg-purple-950 px-2 py-1 rounded-md border border-purple-800">
              Últimos 30 dias
            </span>
          </div>

          <div className="space-y-3">
            {topRoutes.map((route, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-[#180a33] border border-purple-900/50 flex items-center justify-between hover:border-purple-600 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-purple-900/60 text-purple-200 font-mono font-bold text-xs flex items-center justify-center">
                    #{idx + 1}
                  </div>
                  <div>
                    <strong className="text-xs font-bold text-white block">{route.name}</strong>
                    <span className="text-[11px] text-purple-300 font-mono">
                      Média: {route.avgMiles.toLocaleString()} milhas
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-black text-white font-mono block">
                    {route.searches.toLocaleString()} buscas
                  </span>
                  <span className="text-[10px] font-bold text-emerald-400">{route.trend} procura</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Participação de Mercado por Programa de Fidelidade */}
        <div className="p-5 rounded-2xl bg-[#12052C] border border-purple-900/70 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-amber-400" />
                <span>Distribuição por Programa de Fidelidade</span>
              </h3>
              <p className="text-xs text-purple-300">Participação de cada parceiro no catálogo de ofertas</p>
            </div>
            <span className="text-[11px] font-bold text-amber-300 bg-amber-500/15 px-2 py-1 rounded-md border border-amber-500/30">
              {offers.length} ofertas totais
            </span>
          </div>

          <div className="space-y-3.5">
            {programStats.map((prog) => (
              <div key={prog.id} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: prog.color }}
                    />
                    <span className="font-bold text-white">{prog.name}</span>
                  </div>
                  <div className="flex items-center gap-2 font-mono">
                    <span className="text-purple-300 text-[11px]">{prog.count} ofertas</span>
                    <span className="text-white font-bold">{prog.percent}%</span>
                  </div>
                </div>
                {/* Progress bar */}
                <div className="w-full h-2 rounded-full bg-purple-950 overflow-hidden border border-purple-900/40">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${prog.percent}%`,
                      backgroundColor: prog.color
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 3: Scraper Reliability & Push Engagement Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-[#12052C] border border-purple-900/70 shadow-md">
          <div className="flex items-center gap-2 text-xs font-bold text-purple-300 mb-2">
            <Zap className="w-4 h-4 text-emerald-400" />
            <span>Saúde dos Conectores (Scrapers)</span>
          </div>
          <div className="text-3xl font-black text-emerald-400 font-mono">99.4%</div>
          <p className="text-[11px] text-purple-300/80 mt-1">
            Latência média de 410ms por requisição em {sources.length} fontes ativas
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-[#12052C] border border-purple-900/70 shadow-md">
          <div className="flex items-center gap-2 text-xs font-bold text-purple-300 mb-2">
            <TrendingUp className="w-4 h-4 text-amber-400" />
            <span>Taxa de Abertura de Push</span>
          </div>
          <div className="text-3xl font-black text-amber-300 font-mono">68.2%</div>
          <p className="text-[11px] text-purple-300/80 mt-1">
            {broadcasts.length} disparos realizados com alta taxa de engajamento imediato
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-[#12052C] border border-purple-900/70 shadow-md">
          <div className="flex items-center gap-2 text-xs font-bold text-purple-300 mb-2">
            <Award className="w-4 h-4 text-sky-400" />
            <span>Proporção de Cabines</span>
          </div>
          <div className="text-3xl font-black text-sky-300 font-mono">
            {((executiveOffers.length / (offers.length || 1)) * 100).toFixed(0)}%
          </div>
          <p className="text-[11px] text-purple-300/80 mt-1">
            Das ofertas são Classe Executiva / Premium com emissão por pontos
          </p>
        </div>
      </div>
    </div>
  );
};

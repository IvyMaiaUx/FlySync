import React, { useState } from 'react';
import { useFlySync } from '../../store/FlySyncContext';
import {
  Award,
  CheckCircle2,
  Lock,
  Sparkles,
  Plane,
  Compass,
  Crown,
  ShieldCheck,
  Star
} from 'lucide-react';

export interface MilestoneBadge {
  id: string;
  title: string;
  tierName: string;
  requirementDescription: string;
  targetMiles: number;
  unlockedAt?: string;
  category: 'mileage' | 'activity' | 'strategy';
  icon: 'plane' | 'compass' | 'crown' | 'shield' | 'award' | 'star';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export const RewardsBadges: React.FC = () => {
  const { balances, getConsolidatedTotals } = useFlySync();
  const [filter, setFilter] = useState<'all' | 'unlocked' | 'locked'>('all');

  const totals = getConsolidatedTotals();
  const totalCombinedBalance = totals.airlineMiles + totals.bankPoints + totals.avios;

  const BADGES: MilestoneBadge[] = [
    {
      id: 'badge-01',
      title: 'Primeiro Embarque',
      tierName: 'Novato',
      requirementDescription: 'Cadastre seu primeiro saldo de fidelidade na carteira FlySync.',
      targetMiles: 1,
      unlockedAt: '15 de Agosto de 2026',
      category: 'activity',
      icon: 'plane',
      rarity: 'common'
    },
    {
      id: 'badge-02',
      title: 'Bronze Voyager',
      tierName: 'Bronze',
      requirementDescription: 'Atinja 50.000 milhas acumuladas somando seus programas ativos.',
      targetMiles: 50000,
      unlockedAt: '10 de Setembro de 2026',
      category: 'mileage',
      icon: 'compass',
      rarity: 'common'
    },
    {
      id: 'badge-03',
      title: 'Silver Globetrotter',
      tierName: 'Prata',
      requirementDescription: 'Atinja a marca de 150.000 milhas registradas na carteira.',
      targetMiles: 150000,
      unlockedAt: '28 de Dezembro de 2025',
      category: 'mileage',
      icon: 'award',
      rarity: 'rare'
    },
    {
      id: 'badge-04',
      title: 'Gold Transatlantic',
      tierName: 'Ouro',
      requirementDescription: 'Mantenha 300.000 milhas ou pontos consolidados simultaneamente.',
      targetMiles: 300000,
      unlockedAt: '14 de Março de 2026',
      category: 'mileage',
      icon: 'star',
      rarity: 'rare'
    },
    {
      id: 'badge-05',
      title: 'Platinum Jetsetter',
      tierName: 'Platina',
      requirementDescription: 'Acumule 500.000 milhas entre programas aéreos e bancários.',
      targetMiles: 500000,
      category: 'mileage',
      icon: 'shield',
      rarity: 'epic'
    },
    {
      id: 'badge-06',
      title: 'Diamond Elite',
      tierName: 'Diamante',
      requirementDescription: 'Atinja o patamar de 750.000 milhas para emissões de volta ao mundo.',
      targetMiles: 750000,
      category: 'mileage',
      icon: 'crown',
      rarity: 'epic'
    },
    {
      id: 'badge-07',
      title: 'Mile Millionaire',
      tierName: 'Milionário de Milhas',
      requirementDescription: 'Atingir o lendário marco de 1.000.000 de milhas e pontos consolidado.',
      targetMiles: 1000000,
      category: 'mileage',
      icon: 'crown',
      rarity: 'legendary'
    },
    {
      id: 'badge-08',
      title: 'Estrategista de Alianças',
      tierName: 'Especialista',
      requirementDescription: 'Possuir saldos em ao menos 3 alianças/programas globais distintos.',
      targetMiles: 3,
      unlockedAt: '12 de Outubro de 2026',
      category: 'strategy',
      icon: 'award',
      rarity: 'rare'
    },
    {
      id: 'badge-09',
      title: 'Guardião de Vencimento',
      tierName: 'Vigilante',
      requirementDescription: 'Monitore e proteja seus pontos sem deixar nenhum saldo expirar.',
      targetMiles: 1,
      unlockedAt: 'Atualizado hoje',
      category: 'activity',
      icon: 'shield',
      rarity: 'common'
    }
  ];

  const isBadgeUnlocked = (badge: MilestoneBadge) => {
    if (badge.category === 'mileage') {
      return totalCombinedBalance >= badge.targetMiles;
    }
    if (badge.id === 'badge-01') return balances.length >= 1;
    if (badge.id === 'badge-08') return balances.length >= 3;
    if (badge.id === 'badge-09') return true;
    return false;
  };

  const unlockedCount = BADGES.filter(b => isBadgeUnlocked(b)).length;
  const progressPercent = Math.round((unlockedCount / BADGES.length) * 100);

  const nextMileageBadge = BADGES
    .filter(b => b.category === 'mileage' && !isBadgeUnlocked(b))
    .sort((a, b) => a.targetMiles - b.targetMiles)[0];

  const filteredBadges = BADGES.filter((badge) => {
    const unlocked = isBadgeUnlocked(badge);
    if (filter === 'unlocked') return unlocked;
    if (filter === 'locked') return !unlocked;
    return true;
  });

  const renderBadgeIcon = (icon: MilestoneBadge['icon'], isUnlocked: boolean) => {
    const props = { className: `w-5 h-5 ${isUnlocked ? 'text-[#22C55E]' : 'text-slate-500'}` };
    switch (icon) {
      case 'plane': return <Plane {...props} />;
      case 'compass': return <Compass {...props} />;
      case 'crown': return <Crown {...props} />;
      case 'shield': return <ShieldCheck {...props} />;
      case 'star': return <Star {...props} />;
      default: return <Award {...props} />;
    }
  };

  return (
    <div className="p-6 rounded-2xl bg-[#13062C] border border-purple-900/60 shadow-xl space-y-6 text-white">
      {/* Header & Overview */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-purple-900/40">
        <div>
          <div className="flex items-center gap-2 text-xs text-purple-300 font-semibold mb-1">
            <Award className="w-4 h-4 text-[#22C55E]" />
            <span>Programa de Conquistas & Milestones</span>
            <span aria-hidden="true">·</span>
            <span className="text-[#38BDF8]">Evolução de Carteira</span>
          </div>
          <h3 className="text-lg font-bold text-white tracking-tight">
            Conquistas & Selos de Fidelidade
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Acompanhe suas marcas históricas de acúmulo de milhas e desbloqueie títulos exclusivos de viajante frequente.
          </p>
        </div>

        {/* Filter buttons */}
        <div className="inline-flex rounded-lg p-0.5 bg-purple-950/80 border border-purple-900 text-xs self-start sm:self-auto">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-md font-semibold transition-colors ${
              filter === 'all'
                ? 'bg-[#22C55E] text-slate-950 font-bold shadow-xs'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            Todas ({BADGES.length})
          </button>
          <button
            onClick={() => setFilter('unlocked')}
            className={`px-3 py-1.5 rounded-md font-semibold transition-colors ${
              filter === 'unlocked'
                ? 'bg-[#22C55E] text-slate-950 font-bold shadow-xs'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            Conquistadas ({unlockedCount})
          </button>
          <button
            onClick={() => setFilter('locked')}
            className={`px-3 py-1.5 rounded-md font-semibold transition-colors ${
              filter === 'locked'
                ? 'bg-[#22C55E] text-slate-950 font-bold shadow-xs'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            Em Progresso ({BADGES.length - unlockedCount})
          </button>
        </div>
      </div>

      {/* Level Summary Banner */}
      <div className="p-5 rounded-xl bg-gradient-to-r from-[#1E0947] to-[#12052C] border border-purple-800/80 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-md">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-purple-300">
            <Sparkles className="w-3.5 h-3.5 text-[#22C55E]" />
            <span className="uppercase tracking-wider font-bold">Nível de Viajante Atual:</span>
          </div>
          <div className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <span>Viajante Ouro Transatlântico</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-[#22C55E] text-slate-950 font-mono">
              Tier IV
            </span>
          </div>
          <p className="text-xs text-purple-200">
            {unlockedCount} de {BADGES.length} selos conquistados ({progressPercent}% do trajeto completo)
          </p>
        </div>

        {nextMileageBadge && (
          <div className="p-3.5 rounded-lg bg-[#0E0324] border border-purple-800/80 max-w-sm w-full space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-purple-300 font-semibold">Próximo Marco:</span>
              <strong className="text-[#22C55E]">{nextMileageBadge.title}</strong>
            </div>

            <div className="w-full h-2 bg-purple-950 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#22C55E] to-[#38BDF8] rounded-full transition-all duration-300"
                style={{
                  width: `${Math.min(100, (totalCombinedBalance / nextMileageBadge.targetMiles) * 100)}%`
                }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] font-mono text-purple-200">
              <span>{totalCombinedBalance.toLocaleString('pt-BR')} milhas</span>
              <span>Meta: {nextMileageBadge.targetMiles.toLocaleString('pt-BR')}</span>
            </div>
            <div className="text-[11px] text-[#22C55E] text-right font-semibold">
              Faltam apenas {(nextMileageBadge.targetMiles - totalCombinedBalance).toLocaleString('pt-BR')} milhas!
            </div>
          </div>
        )}
      </div>

      {/* Badges Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredBadges.map((badge) => {
          const unlocked = isBadgeUnlocked(badge);
          const currentProgressPct = badge.category === 'mileage'
            ? Math.min(100, Math.round((totalCombinedBalance / badge.targetMiles) * 100))
            : unlocked ? 100 : 0;

          return (
            <div
              key={badge.id}
              className={`p-4 rounded-xl border transition-all flex flex-col justify-between ${
                unlocked
                  ? 'bg-[#180A3A] border-purple-800/70 hover:border-[#22C55E]/60 shadow-md'
                  : 'bg-[#100424]/60 border-purple-950/70 opacity-60'
              }`}
            >
              <div>
                {/* Badge Top Header */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                        unlocked
                          ? 'bg-purple-900/50 border-[#22C55E]/50 shadow-[0_0_12px_rgba(34,197,94,0.2)]'
                          : 'bg-purple-950/40 border-purple-900/40'
                      }`}
                    >
                      {renderBadgeIcon(badge.icon, unlocked)}
                    </div>

                    <div>
                      <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                        {badge.title}
                      </h4>
                      <span className="text-[10px] uppercase font-semibold text-slate-400 block tracking-wide">
                        {badge.tierName}
                      </span>
                    </div>
                  </div>

                  {unlocked ? (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-[#22C55E] bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-md">
                      <CheckCircle2 className="w-3 h-3 text-[#22C55E]" />
                      Conquistado
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[11px] font-semibold text-slate-400 bg-purple-950/60 px-1.5 py-0.5 rounded-md">
                      <Lock className="w-3 h-3" />
                      Bloqueado
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-300 leading-relaxed mb-3">
                  {badge.requirementDescription}
                </p>
              </div>

              {/* Progress and status footer */}
              <div className="pt-3 border-t border-purple-900/40 space-y-1.5">
                {badge.category === 'mileage' && !unlocked && (
                  <div>
                    <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                      <span>Progresso:</span>
                      <span className="font-mono tabular-nums font-bold text-slate-200">
                        {currentProgressPct}%
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-purple-950 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#22C55E] rounded-full"
                        style={{ width: `${currentProgressPct}%` }}
                      />
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono mt-1 text-right">
                      Faltam {(badge.targetMiles - totalCombinedBalance).toLocaleString('pt-BR')} milhas
                    </div>
                  </div>
                )}

                {unlocked && (
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>Desbloqueado:</span>
                    <strong className="text-slate-200">{badge.unlockedAt || 'Verificado'}</strong>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { useFlySync } from '../../store/FlySyncContext';
import { PartnerCampaign } from '../../types';
import {
  Gift,
  ExternalLink,
  Calendar,
  Clock,
  ShieldCheck,
  Calculator,
  ArrowRight,
  Sparkles,
  Percent,
  CheckCircle2,
  Info,
  Ticket
} from 'lucide-react';

export const CampaignsView: React.FC = () => {
  const { campaigns, trackAffiliateClick } = useFlySync();

  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [showExpired, setShowExpired] = useState<boolean>(false);

  // Transfer Bonus Calculator State
  const [calcPoints, setCalcPoints] = useState<number>(30000);
  const [calcBonusPercent, setCalcBonusPercent] = useState<number>(80);
  const [calcSelectedPartner, setCalcSelectedPartner] = useState<string>('Livelo ➔ Smiles');

  const filteredCampaigns = campaigns.filter((camp) => {
    if (!showExpired && camp.status === 'expired') return false;
    if (filterCategory !== 'all' && camp.category !== filterCategory) return false;
    return true;
  });

  const handleOpenCampaignLink = (camp: PartnerCampaign) => {
    const refCode = trackAffiliateClick(camp.id);
    // append referral tracking safely
    try {
      const url = new URL(camp.destinationUrl);
      url.searchParams.set('ref', refCode);
      window.open(url.toString(), '_blank', 'noopener,noreferrer');
    } catch {
      window.open(camp.destinationUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const formatDate = (isoStr: string) => {
    try {
      return new Date(isoStr).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return isoStr;
    }
  };

  const getDaysRemaining = (endsAt: string) => {
    const now = new Date().getTime();
    const end = new Date(endsAt).getTime();
    const diff = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
    if (diff <= 0) return 'Encerrada';
    if (diff === 1) return 'Último dia!';
    return `${diff} dias restantes`;
  };

  // Calculator Math
  const bonusAmount = Math.floor(calcPoints * (calcBonusPercent / 100));
  const totalReceived = calcPoints + bonusAmount;

  return (
    <div className="space-y-8 animate-in fade-in duration-150 text-white">
      {/* View Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-purple-900/40">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Ganhar Milhas
          </h1>
          <p className="text-sm text-slate-300 mt-1 max-w-2xl">
            Promoções de transferência bonificada, compras que dão pontos e descontos em milhas.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-purple-200">
          <label className="flex items-center gap-2 cursor-pointer p-2.5 rounded-xl bg-[#13062C] border border-purple-800/80 hover:border-purple-600 transition-colors">
            <input
              type="checkbox"
              checked={showExpired}
              onChange={(e) => setShowExpired(e.target.checked)}
              className="rounded-sm accent-[#22C55E]"
            />
            <span>Exibir campanhas encerradas</span>
          </label>
        </div>
      </div>

      {/* Bonus Calculator Tool Widget (Styled like the ticket in the logo) */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-[#1C093E] via-[#13062C] to-[#0A021B] border border-emerald-500/40 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5 border-b border-purple-900/60 pb-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-xs text-emerald-400 mb-1 font-semibold">
              <Calculator className="w-4 h-4 text-emerald-400" />
              <span>Simulador de Transferência Bonificada</span>
            </div>
            <h3 className="text-lg font-bold text-white tracking-tight">
              Calcule quantas milhas você receberá na companhia aérea
            </h3>
          </div>
          <div className="text-xs text-purple-300">
            Simulação instantânea com base no bônus vigente
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center relative z-10">
          {/* Inputs */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-purple-200 mb-1">
                Pontos a Transferir do Banco (Livelo, Esfera, etc.)
              </label>
              <input
                type="number"
                step={1000}
                min={1000}
                max={1000000}
                value={calcPoints}
                onChange={(e) => setCalcPoints(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm font-mono tabular-nums bg-purple-950/80 border border-purple-700/80 rounded-xl text-white focus:ring-2 focus:ring-[#22C55E] focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-purple-200 mb-1">
                Porcentagem de Bônus da Promoção
              </label>
              <div className="flex gap-2">
                {[60, 70, 80, 100].map((pct) => (
                  <button
                    key={pct}
                    onClick={() => setCalcBonusPercent(pct)}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                      calcBonusPercent === pct
                        ? 'bg-[#22C55E] text-slate-950 shadow-md font-black'
                        : 'bg-purple-950/80 text-purple-200 border border-purple-800 hover:bg-purple-900'
                    }`}
                  >
                    {pct}%
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Arrow / Connection */}
          <div className="hidden md:flex flex-col items-center justify-center text-purple-400">
            <span className="text-xs mb-1 font-semibold text-emerald-400">Transferência 1:1</span>
            <div className="w-16 h-px bg-purple-800 relative flex items-center justify-end">
              <ArrowRight className="w-4 h-4 text-emerald-400" />
            </div>
            <span className="text-[11px] text-purple-300 mt-1">+{calcBonusPercent}% bonificação</span>
          </div>

          {/* Result Card styled like the Ticket */}
          <div className="p-4 rounded-xl bg-purple-950/80 border border-emerald-500/40 space-y-2 shadow-lg">
            <div className="flex items-center justify-between text-xs text-purple-300">
              <span>Saldo Base:</span>
              <span className="font-mono tabular-nums">{calcPoints.toLocaleString('pt-BR')} pts</span>
            </div>
            <div className="flex items-center justify-between text-xs text-emerald-400 font-semibold">
              <span>Bônus (+{calcBonusPercent}%):</span>
              <span className="font-mono tabular-nums">+{bonusAmount.toLocaleString('pt-BR')} milhas</span>
            </div>
            <div className="pt-2 border-t border-purple-800/80 flex items-center justify-between">
              <span className="text-xs font-bold text-white uppercase tracking-wider">Total Creditado:</span>
              <span className="text-2xl font-black text-[#22C55E] font-mono tabular-nums">
                {totalReceived.toLocaleString('pt-BR')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        <button
          onClick={() => setFilterCategory('all')}
          className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
            filterCategory === 'all'
              ? 'bg-[#22C55E] text-slate-950 font-bold shadow-xs'
              : 'bg-[#13062C] text-slate-300 border border-purple-800/80 hover:bg-purple-900/40 hover:text-white'
          }`}
        >
          Todas as Campanhas
        </button>
        <button
          onClick={() => setFilterCategory('transfer_bonus')}
          className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
            filterCategory === 'transfer_bonus'
              ? 'bg-[#22C55E] text-slate-950 font-bold shadow-xs'
              : 'bg-[#13062C] text-slate-300 border border-purple-800/80 hover:bg-purple-900/40 hover:text-white'
          }`}
        >
          Bônus de Transferência
        </button>
        <button
          onClick={() => setFilterCategory('shopping_points')}
          className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
            filterCategory === 'shopping_points'
              ? 'bg-[#22C55E] text-slate-950 font-bold shadow-xs'
              : 'bg-[#13062C] text-slate-300 border border-purple-800/80 hover:bg-purple-900/40 hover:text-white'
          }`}
        >
          Compras Bonificadas (Varejo)
        </button>
        <button
          onClick={() => setFilterCategory('buy_points')}
          className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
            filterCategory === 'buy_points'
              ? 'bg-[#22C55E] text-slate-950 font-bold shadow-xs'
              : 'bg-[#13062C] text-slate-300 border border-purple-800/80 hover:bg-purple-900/40 hover:text-white'
          }`}
        >
          Compra de Pontos com Desconto
        </button>
      </div>

      {/* Campaigns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredCampaigns.map((camp) => {
          const isExpired = camp.status === 'expired';
          const remainingText = getDaysRemaining(camp.endsAt);

          return (
            <div
              key={camp.id}
              className={`p-5 rounded-2xl bg-[#13062C] border transition-all flex flex-col justify-between shadow-md ${
                isExpired
                  ? 'border-purple-950 opacity-60 bg-[#0E0320]'
                  : 'border-purple-900/70 hover:border-emerald-500/60 hover:shadow-lg'
              }`}
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <span className="text-xs font-bold text-emerald-400">
                      {camp.partnerName}
                    </span>
                    <h3 className="text-base font-bold text-white mt-0.5">
                      {camp.title}
                    </h3>
                  </div>

                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider shrink-0 ${
                    isExpired
                      ? 'bg-purple-950 text-slate-400 border border-purple-900'
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  }`}>
                    {remainingText}
                  </span>
                </div>

                <p className="text-xs text-purple-200/80 mb-3 leading-relaxed">
                  {camp.description}
                </p>

                {/* Highlights Pill */}
                <div className="p-2.5 rounded-xl bg-purple-950/70 border border-purple-800/60 mb-3 flex items-center justify-between text-xs">
                  <span className="text-purple-300">Regra Principal:</span>
                  <span className="font-bold text-emerald-400">{camp.termsSummary || camp.badgeText || 'Regras no canal parceiro'}</span>
                </div>

                {/* Validity and Affiliate Disclosure */}
                <div className="flex items-center justify-between text-[11px] text-purple-300/80 mb-2">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    Válido até: {formatDate(camp.endsAt)}
                  </span>
                  {camp.isAffiliate && (
                    <span className="text-[10px] text-slate-400 bg-purple-950 px-1.5 py-0.5 rounded-sm border border-purple-900">
                      Link Parceiro
                    </span>
                  )}
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-3 border-t border-purple-900/60 mt-3">
                <button
                  onClick={() => handleOpenCampaignLink(camp)}
                  disabled={isExpired}
                  className={`w-full py-2 px-3 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all ${
                    isExpired
                      ? 'bg-purple-950 text-slate-500 cursor-not-allowed border border-purple-900'
                      : 'bg-gradient-to-r from-[#4ADE80] to-[#22C55E] hover:from-[#22C55E] hover:to-[#16A34A] text-slate-950 shadow-[0_0_15px_rgba(34,197,94,0.3)] active:scale-98'
                  }`}
                >
                  <span>{isExpired ? 'Campanha Encerrada' : 'Acessar no Canal Oficial'}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

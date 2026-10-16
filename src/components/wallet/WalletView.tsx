import React, { useState } from 'react';
import { useFlySync } from '../../store/FlySyncContext';
import { BalanceModal } from './BalanceModal';
import { HistoryModal } from './HistoryModal';
import { MilesCalculator } from './MilesCalculator';
import { MonthlyTrendsChart } from './MonthlyTrendsChart';
import { RewardsBadges } from './RewardsBadges';
import { ExpertTips } from './ExpertTips';
import { MileageBalance, LoyaltyProgram } from '../../types';
import {
  Plus,
  AlertTriangle,
  Calendar,
  History,
  Trash2,
  Edit2,
  TrendingUp,
  Clock,
  Calculator,
  Award,
  Sparkles,
  Lightbulb
} from 'lucide-react';

interface WalletViewProps {
  onNavigate?: (tab: string) => void;
}

export const WalletView: React.FC<WalletViewProps> = ({ onNavigate }) => {
  const {
    balances,
    programs,
    balanceHistory,
    deleteBalance,
    getConsolidatedTotals
  } = useFlySync();

  const [isBalanceModalOpen, setIsBalanceModalOpen] = useState(false);
  const [editingBalance, setEditingBalance] = useState<MileageBalance | null>(null);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [historyFilterProgram, setHistoryFilterProgram] = useState<string | undefined>();

  const totals = getConsolidatedTotals();

  const getExpirationStatus = (expiresAt?: string | null) => {
    if (!expiresAt) {
      return {
        label: 'Não expira (Permanente)',
        status: 'permanent',
        daysLeft: null,
        className: 'text-slate-400'
      };
    }

    const now = new Date().getTime();
    const exp = new Date(expiresAt).getTime();
    const diffDays = Math.ceil((exp - now) / (1000 * 60 * 60 * 24));

    if (diffDays <= 0) {
      return {
        label: 'Expirado',
        status: 'expired',
        daysLeft: 0,
        className: 'text-rose-400 font-semibold'
      };
    } else if (diffDays <= 30) {
      return {
        label: `Expira em ${diffDays} dias`,
        status: 'warning',
        daysLeft: diffDays,
        className: 'text-amber-400 font-bold'
      };
    } else {
      const expDate = new Date(expiresAt).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
      return {
        label: `Válido até ${expDate} (${diffDays}d)`,
        status: 'healthy',
        daysLeft: diffDays,
        className: 'text-slate-400'
      };
    }
  };

  const handleOpenAdd = () => {
    setEditingBalance(null);
    setIsBalanceModalOpen(true);
  };

  const handleOpenEdit = (bal: MileageBalance) => {
    setEditingBalance(bal);
    setIsBalanceModalOpen(true);
  };

  const handleOpenProgramHistory = (programName: string) => {
    setHistoryFilterProgram(programName);
    setIsHistoryModalOpen(true);
  };

  const handleOpenAllHistory = () => {
    setHistoryFilterProgram(undefined);
    setIsHistoryModalOpen(true);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-150">
      {/* Top Banner & Title Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-purple-900/40">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Minha Carteira
          </h1>
          <p className="text-sm text-slate-300 mt-1 max-w-2xl">
            Seus saldos de milhas e pontos em um só lugar. Não pedimos sua senha.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-3 shrink-0">
          {/* Quick jump pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none -mx-3 px-3 sm:mx-0 sm:px-0 sm:flex-wrap">
            <button
              onClick={() => {
                const el = document.getElementById('expert-tips');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-2.5 py-1.5 text-xs font-semibold text-slate-200 bg-[#160833] border border-emerald-500/40 hover:bg-emerald-950/40 hover:text-white rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shadow-[0_0_10px_rgba(34,197,94,0.15)] shrink-0"
            >
              <Lightbulb className="w-3.5 h-3.5 text-[#22C55E]" />
              <span>Dicas</span>
            </button>
            <button
              onClick={() => {
                const el = document.getElementById('rewards-badges');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-2.5 py-1.5 text-xs font-semibold text-slate-200 bg-[#160833] border border-purple-800/60 hover:bg-purple-900/40 hover:text-white rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0"
            >
              <Award className="w-3.5 h-3.5 text-[#22C55E]" />
              <span>Conquistas</span>
            </button>
            <button
              onClick={() => {
                const el = document.getElementById('monthly-trends');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-2.5 py-1.5 text-xs font-semibold text-slate-200 bg-[#160833] border border-purple-800/60 hover:bg-purple-900/40 hover:text-white rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0"
            >
              <TrendingUp className="w-3.5 h-3.5 text-[#38BDF8]" />
              <span>Evolução</span>
            </button>
            <button
              onClick={() => {
                const el = document.getElementById('miles-calculator');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-2.5 py-1.5 text-xs font-semibold text-slate-200 bg-[#160833] border border-purple-800/60 hover:bg-purple-900/40 hover:text-white rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0"
            >
              <Calculator className="w-3.5 h-3.5 text-purple-400" />
              <span>Calculadora</span>
            </button>
          </div>

          {/* Primary Action Buttons */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handleOpenAllHistory}
              className="px-3 py-2 text-xs font-semibold text-slate-300 bg-[#160833] border border-purple-800/60 hover:bg-purple-900/40 hover:text-white rounded-lg transition-colors flex items-center justify-center gap-1.5 shrink-0"
            >
              <History className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden sm:inline">Histórico</span>
            </button>
            <button
              onClick={handleOpenAdd}
              className="flex-1 sm:flex-initial px-4 py-2 text-xs font-bold text-slate-950 bg-[#22C55E] hover:bg-emerald-400 rounded-lg shadow-[0_0_15px_rgba(34,197,94,0.3)] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Adicionar Saldo</span>
            </button>
          </div>
        </div>
      </div>

      {/* Expiration Alert Banner */}
      {totals.expiringWithin30DaysCount > 0 && (
        <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-500/40 flex items-start gap-3 backdrop-blur-xs">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="text-xs font-bold text-amber-300">
              Atenção: Saldo prestes a vencer nos próximos 30 dias
            </h4>
            <p className="text-xs text-amber-200/80 mt-0.5">
              Você possui {totals.expiringWithin30DaysCount} programa(s) com milhas ou pontos próximos da expiração. Verifique as oportunidades no Radar de Ofertas ou emita um resgate antes do prazo informado.
            </p>
          </div>
        </div>
      )}

      {/* Consolidated Totals by Native Unit Type (RN02) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Card 1: Milhas Aéreas */}
        <div className="p-5 rounded-2xl bg-[#13062C] border border-purple-900/60 shadow-lg relative overflow-hidden group hover:border-[#38BDF8]/50 transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-full blur-xl pointer-events-none" />
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="font-semibold uppercase tracking-wider text-[11px] text-cyan-300">
              Milhas Aéreas
            </span>
            <span className="text-[11px] text-slate-400">Smiles, TAP, Azul</span>
          </div>
          <div className="text-3xl font-black text-white font-mono tabular-nums tracking-tight">
            {totals.airlineMiles.toLocaleString('pt-BR')}
          </div>
          <p className="text-xs text-slate-400 mt-1.5">
            Total em milhas prontas para emissão de voos
          </p>
        </div>

        {/* Card 2: Pontos Bancários / Varejo */}
        <div className="p-5 rounded-2xl bg-[#13062C] border border-purple-900/60 shadow-lg relative overflow-hidden group hover:border-[#22C55E]/50 transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl pointer-events-none" />
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="font-semibold uppercase tracking-wider text-[11px] text-[#22C55E]">
              Pontos Bancários
            </span>
            <span className="text-[11px] text-slate-400">Livelo, Esfera, LATAM</span>
          </div>
          <div className="text-3xl font-black text-[#22C55E] font-mono tabular-nums tracking-tight">
            {totals.bankPoints.toLocaleString('pt-BR')}
          </div>
          <p className="text-xs text-slate-400 mt-1.5">
            Elegíveis para bonificação de até 80%+ em transferências
          </p>
        </div>

        {/* Card 3: Avios & Alianças Globais */}
        <div className="p-5 rounded-2xl bg-[#13062C] border border-purple-900/60 shadow-lg relative overflow-hidden group hover:border-emerald-400/50 transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-xl pointer-events-none" />
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="font-semibold uppercase tracking-wider text-[11px] text-purple-300">
              Avios & Parceiras
            </span>
            <span className="text-[11px] text-slate-400">Iberia Plus, British</span>
          </div>
          <div className="text-3xl font-black text-emerald-300 font-mono tabular-nums tracking-tight">
            {totals.avios.toLocaleString('pt-BR')}
          </div>
          <p className="text-xs text-slate-400 mt-1.5">
            Sweet spots para Europa e Estados Unidos
          </p>
        </div>
      </div>

      {/* Program Balances List */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-white">
            Detalhamento por Programa de Fidelidade ({balances.length})
          </h2>
          <span className="text-xs text-slate-400">
            Valores atualizados manualmente pelos canais oficiais
          </span>
        </div>

        {balances.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-[#13062C] border border-purple-900/60">
            <div className="w-12 h-12 mx-auto rounded-full bg-purple-900/40 flex items-center justify-center text-[#22C55E] mb-3">
              <TrendingUp className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-white">Sua carteira está vazia</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 mb-4">
              Comece cadastrando seu primeiro saldo (Smiles, LATAM Pass, Azul, Livelo) para monitorar vencimentos e oportunidades de emissão.
            </p>
            <button
              onClick={handleOpenAdd}
              className="px-4 py-2 text-xs font-bold text-slate-950 bg-[#22C55E] hover:bg-emerald-400 rounded-lg transition-colors"
            >
              Cadastrar Primeiro Programa
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {balances.map((bal) => {
              const prog = programs.find(p => p.id === bal.programId);
              if (!prog) return null;
              const exp = getExpirationStatus(bal.expiresAt);
              const observedDate = new Date(bal.observedAt).toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit'
              });

              return (
                <div
                  key={bal.id}
                  className="p-5 rounded-2xl bg-[#13062C] border border-purple-900/60 hover:border-[#22C55E]/50 transition-all flex flex-col justify-between shadow-md"
                >
                  <div>
                    {/* Program Header */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: prog.color }}
                          />
                          <h3 className="text-sm font-bold text-white">
                            {prog.name}
                          </h3>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {prog.airlineAlliance || (prog.category === 'bank' ? 'Bancário' : 'Companhia Aérea')}
                          {bal.accountNumber && ` · Conta ${bal.accountNumber}`}
                        </p>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEdit(bal)}
                          className="p-1.5 text-slate-400 hover:text-white hover:bg-white/5 rounded-md transition-colors"
                          title="Atualizar saldo"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => deleteBalance(bal.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-md transition-colors"
                          title="Remover programa"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Balance Figure */}
                    <div className="py-2">
                      <div className="text-2xl font-black text-white font-mono tabular-nums tracking-tight">
                        {bal.balance.toLocaleString('pt-BR')}
                      </div>
                      <span className="text-xs font-semibold text-[#22C55E] uppercase tracking-wide">
                        {prog.unitLabel}
                      </span>
                    </div>

                    {/* Expiration & Notes */}
                    <div className="mt-3 pt-3 border-t border-purple-900/40 space-y-1.5 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-500" />
                          Validade:
                        </span>
                        <span className={`text-[11px] ${exp.className}`}>
                          {exp.label}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-slate-400 text-[11px]">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-500" />
                          Última conferência:
                        </span>
                        <span>{observedDate}</span>
                      </div>

                      {bal.notes && (
                        <p className="text-[11px] text-slate-400 italic pt-1 truncate">
                          "{bal.notes}"
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="mt-4 pt-3 border-t border-purple-900/40 flex items-center justify-between">
                    <button
                      onClick={() => handleOpenProgramHistory(prog.name)}
                      className="text-[11px] font-medium text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
                    >
                      <History className="w-3 h-3" />
                      Lançamentos
                    </button>

                    <button
                      onClick={() => handleOpenEdit(bal)}
                      className="px-2.5 py-1 text-xs font-bold text-[#22C55E] hover:bg-emerald-500/10 rounded-md transition-colors"
                    >
                      Ajustar Saldo
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Expert Optimization Tips & Transfer Simulator */}
      <div id="expert-tips" className="pt-2">
        <ExpertTips onNavigate={onNavigate} />
      </div>

      {/* 12-Month Accumulation Trends Line Chart */}
      <div id="monthly-trends" className="pt-2">
        <MonthlyTrendsChart />
      </div>

      {/* Miles Calculator for Future Flights */}
      <div id="miles-calculator" className="pt-2">
        <MilesCalculator />
      </div>

      {/* Rewards & Badges Milestone Achievements */}
      <div id="rewards-badges" className="pt-2">
        <RewardsBadges />
      </div>

      {/* Modals */}
      <BalanceModal
        isOpen={isBalanceModalOpen}
        onClose={() => setIsBalanceModalOpen(false)}
        initialBalance={editingBalance}
      />

      <HistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        history={balanceHistory}
        programFilter={historyFilterProgram}
      />
    </div>
  );
};

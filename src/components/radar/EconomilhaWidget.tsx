import React, { useState, useMemo } from 'react';
import { analyzeOfferEconomilha, EconomilhaAnalysis } from '../../utils/economilha';
import { FlightOffer } from '../../types';
import {
  Calculator,
  TrendingDown,
  CheckCircle2,
  DollarSign,
  Layers,
  ArrowRight,
  Sliders,
  HelpCircle,
  Sparkles
} from 'lucide-react';

interface EconomilhaWidgetProps {
  offer: FlightOffer;
}

export const EconomilhaWidget: React.FC<EconomilhaWidgetProps> = ({ offer }) => {
  const [customCpm, setCustomCpm] = useState<number | undefined>(undefined);
  const [isCustomizing, setIsCustomizing] = useState<boolean>(false);

  const analysis: EconomilhaAnalysis = useMemo(() => {
    return analyzeOfferEconomilha(
      offer.programId,
      offer.cabinClass,
      offer.miles,
      offer.cashAmount,
      offer.origin,
      offer.destination,
      customCpm
    );
  }, [offer, customCpm]);

  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-b from-[#160633] via-[#12042B] to-[#0D021F] border border-purple-800/80 shadow-xl space-y-4 text-slate-200">
      
      {/* Cabeçalho do Termômetro Economilha */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-purple-900/60 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-purple-900/40 border border-purple-700/60 text-[#38BDF8]">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm sm:text-base font-black text-white tracking-tight">
                Termômetro EconoMilha
              </h4>
              <span className="text-[10px] bg-purple-800/60 text-purple-200 font-bold px-1.5 py-0.5 rounded uppercase">
                Milhas vs. Dinheiro
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Descubra quanto você realmente economiza emitindo esta passagem em milhas.
            </p>
          </div>
        </div>

        {/* Botão de Customizar CPM */}
        <button
          type="button"
          onClick={() => setIsCustomizing(!isCustomizing)}
          className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-[#200A4C] hover:bg-[#2B0E63] border border-purple-700/60 text-[#38BDF8] flex items-center gap-1.5 self-start sm:self-auto transition-colors"
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>{isCustomizing ? 'Fechar ajuste' : `Custo milheiro: R$ ${analysis.cpmUsed.toFixed(2)}`}</span>
        </button>
      </div>

      {/* Painel expansível de ajuste do Custo do Milheiro */}
      {isCustomizing && (
        <div className="p-3.5 rounded-xl bg-[#0B0218] border border-purple-800/60 space-y-2 animate-fadeIn">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <span>Seu custo por 1.000 milhas (CPM):</span>
            </span>
            <span className="text-xs font-mono font-bold text-[#22C55E]">
              R$ {analysis.cpmUsed.toFixed(2)} / milheiro
            </span>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min={10}
              max={40}
              step={0.5}
              value={analysis.cpmUsed}
              onChange={(e) => setCustomCpm(parseFloat(e.target.value))}
              className="flex-1 accent-[#22C55E] cursor-pointer"
            />
            <button
              type="button"
              onClick={() => setCustomCpm(undefined)}
              className="text-[10px] text-slate-400 hover:text-white underline"
            >
              Restaurar padrão
            </button>
          </div>
          <p className="text-[11px] text-slate-400">
            Dica: Se você gerou milhas em promoções bonificadas (ex: Livelo 100%), diminua para ver sua economia real ampliada.
          </p>
        </div>
      )}

      {/* Veredito Visual & Comparativo Dinheiro vs Milhas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        
        {/* Card: Custo Total em Milhas */}
        <div className="p-3.5 rounded-xl bg-[#19083B] border border-purple-800/60 space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">
            Custo Real Emitindo com Milhas
          </span>
          <div className="text-2xl font-black text-[#22C55E] font-mono tracking-tight flex items-baseline gap-1.5">
            <span>R$ {analysis.totalCostReais.toLocaleString('pt-BR')}</span>
            <span className="text-xs font-normal text-slate-300 font-sans">total</span>
          </div>
          <p className="text-[11px] text-slate-300">
            {offer.miles.toLocaleString('pt-BR')} milhas (R$ {analysis.milesCostReais.toLocaleString('pt-BR')}) + R$ {offer.cashAmount.toFixed(2)} taxas
          </p>
        </div>

        {/* Card: Tarifa em Dinheiro (Pagante) */}
        <div className="p-3.5 rounded-xl bg-[#19083B] border border-purple-800/60 space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">
            Tarifa Pagante no Balcão (Dinheiro)
          </span>
          <div className="text-2xl font-black text-slate-300 font-mono tracking-tight flex items-baseline gap-1.5 line-through opacity-85">
            <span>R$ {analysis.estimatedCashPrice.toLocaleString('pt-BR')}</span>
          </div>
          <p className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
            <TrendingDown className="w-3.5 h-3.5" />
            <span>Você economiza R$ {analysis.savedReais.toLocaleString('pt-BR')} ({analysis.savedPercent}% OFF)!</span>
          </p>
        </div>
      </div>

      {/* Banner de Decisão do Termômetro */}
      <div className={`p-3 rounded-xl border flex items-center gap-3 ${analysis.verdictBadge}`}>
        {analysis.verdict === 'super_deal' && (
          <div className="text-xl shrink-0">🔥</div>
        )}
        <div className="space-y-0.5">
          <h5 className="text-xs font-black uppercase tracking-wider">{analysis.verdictLabel}</h5>
          <p className="text-xs font-medium opacity-95">{analysis.verdictMessage}</p>
        </div>
      </div>

      {/* TABELA COMPARATIVA MULTI-PROGRAMA (Smiles vs LATAM vs Azul vs Dinheiro) */}
      <div className="space-y-2 pt-2 border-t border-purple-900/60">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-white flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-[#38BDF8]" />
            <span>Comparativo Multi-Programa nesta Rota ({offer.origin} ➔ {offer.destination})</span>
          </span>
          <span className="text-[10px] text-slate-400">Preços estimados p/ cabine {offer.cabinClass}</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {analysis.programComparison.map((prog) => (
            <div
              key={prog.programName}
              className={`p-3 rounded-xl border transition-all relative ${
                prog.isCurrent
                  ? 'bg-purple-900/40 border-purple-600 shadow-[0_0_12px_rgba(56,189,248,0.2)] ring-1 ring-[#38BDF8]'
                  : 'bg-[#14062E] border-purple-900/60'
              }`}
            >
              {prog.isBestOption && (
                <span className="absolute -top-2 right-2 bg-emerald-500 text-slate-950 text-[9px] font-black uppercase px-1.5 py-0.5 rounded shadow-sm flex items-center gap-0.5">
                  <Sparkles className="w-2.5 h-2.5 fill-current" />
                  Melhor Custo
                </span>
              )}
              {prog.isCurrent && !prog.isBestOption && (
                <span className="absolute -top-2 right-2 bg-[#38BDF8] text-slate-950 text-[9px] font-black uppercase px-1.5 py-0.5 rounded shadow-sm">
                  Voo Selecionado
                </span>
              )}

              <div className="font-extrabold text-xs text-white flex items-center justify-between">
                <span>{prog.programName}</span>
              </div>
              <div className="text-base font-black text-white font-mono mt-1">
                {prog.miles.toLocaleString('pt-BR')}{' '}
                <span className="text-[10px] text-[#22C55E] uppercase font-bold">milhas</span>
              </div>
              <div className="text-xs text-slate-300 font-semibold mt-0.5">
                Custo estimado: <strong className="text-white">R$ {prog.totalReais.toLocaleString('pt-BR')}</strong>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

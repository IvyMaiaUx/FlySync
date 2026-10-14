import React, { useState } from 'react';
import { useFlySync } from '../../store/FlySyncContext';
import { FlySyncLogo } from './FlySyncLogo';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { PWAInstallModal } from '../pwa/PWAInstallModal';
import {
  Plane,
  Ticket,
  Radar,
  Sparkles,
  Download,
  ShieldCheck,
  CheckCircle2,
  TrendingUp,
  ArrowRight
} from 'lucide-react';

interface FlySyncBrandIdentityHeroProps {
  onNavigateToTab?: (tab: string) => void;
}

export const FlySyncBrandIdentityHero: React.FC<FlySyncBrandIdentityHeroProps> = ({ onNavigateToTab }) => {
  const { offers, balances, getConsolidatedTotals } = useFlySync();
  const { isInstallable, isInstalled, isIOS } = usePWAInstall();
  const [isPwaModalOpen, setIsPwaModalOpen] = useState(false);

  const totals = getConsolidatedTotals();
  const activeOffersCount = offers.filter(o => o.status === 'ativa').length;

  return (
    <div className="relative mb-8 rounded-3xl overflow-hidden border border-purple-800/60 bg-gradient-to-br from-[#1C093E] via-[#12052B] to-[#080117] p-5 sm:p-7 shadow-2xl">
      {/* Background SVG Radar Rings & Orbital Trails mirroring the Logo */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30">
        <svg
          className="absolute -right-24 -top-24 w-96 h-96 sm:w-[500px] sm:h-[500px] text-cyan-500/20"
          viewBox="0 0 500 500"
          fill="none"
        >
          {/* Radar Circles */}
          <circle cx="250" cy="250" r="100" stroke="currentColor" strokeWidth="1" strokeDasharray="4 4" />
          <circle cx="250" cy="250" r="180" stroke="currentColor" strokeWidth="1" />
          <circle cx="250" cy="250" r="240" stroke="currentColor" strokeWidth="1" strokeDasharray="6 6" />
          {/* Radar Axis */}
          <line x1="250" y1="10" x2="250" y2="490" stroke="currentColor" strokeWidth="1" strokeOpacity="0.4" />
          <line x1="10" y1="250" x2="490" y2="250" stroke="currentColor" strokeWidth="1" strokeOpacity="0.4" />
          {/* Sweeping trail */}
          <path
            d="M 100 350 C 180 320, 280 200, 420 120"
            stroke="url(#heroTrailGrad)"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <defs>
            <linearGradient id="heroTrailGrad" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#00E5FF" stopOpacity="0" />
              <stop offset="50%" stopColor="#38BDF8" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#22C55E" stopOpacity="1" />
            </linearGradient>
          </defs>
        </svg>

        {/* Ambient Nebula Glows */}
        <div className="absolute top-1/4 left-1/3 w-64 h-64 bg-[#22C55E]/15 rounded-full blur-3xl" />
        <div className="absolute -bottom-10 right-1/4 w-72 h-72 bg-[#38BDF8]/15 rounded-full blur-3xl" />
      </div>

      {/* Main Content Layout */}
      <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        {/* Left Column: Brand Emblem, Slogan and Narrative */}
        <div className="max-w-2xl">
          <div className="flex flex-wrap items-center gap-3 mb-3">
            <FlySyncLogo size="xl" showWordmark={true} isDarkTheme={true} />
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/35 text-[11px] font-bold text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Radar Operacional 24/7</span>
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-cyan-500/15 border border-cyan-500/35 text-[10px] font-bold text-cyan-300">
                <Radar className="w-3 h-3 text-cyan-400" />
                <span>PWA Instalável</span>
              </span>
            </div>
          </div>

          <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>Milhas sob controle. Oportunidades no radar.</span>
          </h2>
          <p className="text-xs sm:text-sm text-purple-200/90 mt-1.5 leading-relaxed">
            A plataforma definitiva de inteligência de fidelidade. Unimos a <strong>gestão rigorosa dos seus saldos</strong> (o bilhete verde) à <strong>varredura contínua de passagens promocionais</strong> (o jato supersônico cyan).
          </p>

          {/* Quick Dual-Pillar Indicators echoing the Logo symbols */}
          <div className="mt-4 flex flex-wrap items-center gap-3 text-xs">
            {/* Pillar 1: Ticket / Miles */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-purple-950/60 border border-emerald-500/30">
              <div className="w-5 h-5 rounded-md bg-emerald-500/20 text-[#22C55E] flex items-center justify-center shrink-0">
                <Ticket className="w-3.5 h-3.5" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block leading-tight">Milhas Consolidadas</span>
                <span className="font-mono font-bold text-emerald-400 text-xs tabular-nums">
                  {(totals.airlineMiles + totals.bankPoints + totals.avios).toLocaleString('pt-BR')} pts
                </span>
              </div>
            </div>

            {/* Pillar 2: Jet / Offers */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-purple-950/60 border border-cyan-500/30">
              <div className="w-5 h-5 rounded-md bg-cyan-500/20 text-[#38BDF8] flex items-center justify-center shrink-0">
                <Plane className="w-3.5 h-3.5" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block leading-tight">Oportunidades no Radar</span>
                <span className="font-mono font-bold text-cyan-300 text-xs tabular-nums">
                  {activeOffersCount} voos ativos
                </span>
              </div>
            </div>

            {/* Pillar 3: Privacy */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-950/40 border border-purple-800/40 text-[11px] text-purple-300">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Sem custódia de senhas (LGPD)</span>
            </div>
          </div>
        </div>

        {/* Right Column: PWA Installation CTA & Quick Actions */}
        <div className="flex flex-col sm:flex-row lg:flex-col items-stretch gap-3 shrink-0 w-full sm:w-auto">
          {!isInstalled ? (
            <button
              onClick={() => setIsPwaModalOpen(true)}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-[#4ADE80] via-[#22C55E] to-[#10B981] hover:from-[#22C55E] hover:to-[#059669] text-slate-950 font-extrabold text-xs shadow-[0_0_25px_rgba(34,197,94,0.4)] transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2.5 group"
            >
              <Download className="w-4 h-4 stroke-[2.5] group-hover:-translate-y-0.5 transition-transform" />
              <div className="text-left">
                <span className="block text-[11px] font-black uppercase tracking-wider leading-none">
                  Instalar FlySync App (PWA)
                </span>
                <span className="block text-[10px] text-slate-900/80 font-semibold mt-0.5">
                  acesso rápido
                </span>
              </div>
            </button>
          ) : (
            <div className="px-4 py-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>FlySync PWA instalado no seu dispositivo</span>
            </div>
          )}

          {onNavigateToTab && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onNavigateToTab('radar')}
                className="flex-1 px-4 py-2 rounded-xl bg-[#170736] border border-cyan-500/40 hover:border-cyan-400 text-xs font-semibold text-cyan-300 hover:text-white transition-all flex items-center justify-center gap-1.5"
              >
                <Plane className="w-3.5 h-3.5 text-cyan-400" />
                <span>Explorar Radar</span>
              </button>
              <button
                onClick={() => onNavigateToTab('wallet')}
                className="flex-1 px-4 py-2 rounded-xl bg-[#170736] border border-emerald-500/40 hover:border-emerald-400 text-xs font-semibold text-emerald-300 hover:text-white transition-all flex items-center justify-center gap-1.5"
              >
                <Ticket className="w-3.5 h-3.5 text-emerald-400" />
                <span>Minha Carteira</span>
              </button>
            </div>
          )}
        </div>
      </div>

      <PWAInstallModal
        isOpen={isPwaModalOpen}
        onClose={() => setIsPwaModalOpen(false)}
      />
    </div>
  );
};

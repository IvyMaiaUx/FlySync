import React, { useState } from 'react';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { Download, Smartphone } from 'lucide-react';
import { PWAInstallModal } from '../pwa/PWAInstallModal';

export const PWAInstallButton: React.FC = () => {
  const { isInstalled, isIOS } = usePWAInstall();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // If already running as an installed PWA, render a sleek subtle badge indicating standalone native mode
  if (isInstalled) {
    return (
      <div className="hidden sm:flex flex-col items-center leading-none select-none">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-[10px] font-bold text-emerald-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>App Instalado</span>
        </span>
        <span className="text-[9px] text-emerald-400/80 font-medium mt-0.5">acesso rápido</span>
      </div>
    );
  }

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="flex items-center gap-1.5 sm:gap-2 rounded-xl bg-gradient-to-r from-[#4ADE80] to-[#22C55E] hover:from-[#22C55E] hover:to-[#16A34A] px-2 sm:px-3 py-1.5 sm:py-1 text-slate-950 shadow-[0_0_15px_rgba(34,197,94,0.35)] transition-all hover:scale-[1.02] active:scale-[0.98] text-left cursor-pointer shrink-0"
        title="Instalar FlySync no seu dispositivo"
        aria-label="Instalar FlySync"
      >
        {isIOS ? (
          <Smartphone className="w-3.5 h-3.5 stroke-[2.5] shrink-0" />
        ) : (
          <Download className="w-3.5 h-3.5 stroke-[2.5] shrink-0" />
        )}
        <div className="flex flex-col leading-tight">
          <span className="text-[11px] sm:text-xs font-black tracking-tight whitespace-nowrap">
            <span className="inline sm:hidden">Instalar</span>
            <span className="hidden sm:inline">{isIOS ? 'Instalar no iPhone' : 'Instalar App'}</span>
          </span>
          <span className="hidden sm:inline text-[9px] font-semibold text-slate-900/90 -mt-0.5">acesso rápido</span>
        </div>
      </button>

      <PWAInstallModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
};

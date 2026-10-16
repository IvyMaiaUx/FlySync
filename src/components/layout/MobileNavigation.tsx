import React from 'react';
import { Home, Tag, Search, Calculator, Wallet } from 'lucide-react';

interface MobileNavigationProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
}

export const MobileNavigation: React.FC<MobileNavigationProps> = ({ currentTab, setCurrentTab }) => {
  const tabs = [
    { id: 'home', label: 'Hoje', icon: Home },
    { id: 'radar', label: 'Ofertas', icon: Tag },
    { id: 'search', label: 'Buscar', icon: Search },
    { id: 'campaigns', label: 'Ganhar', icon: Calculator },
    { id: 'wallet', label: 'Carteira', icon: Wallet }
  ];

  return (
    <nav className="md:hidden fixed left-3 right-3 bottom-[calc(10px+env(safe-area-inset-bottom,0px))] z-40 max-w-[520px] mx-auto grid grid-cols-5 gap-1 p-2 rounded-[24px] bg-[#110d1d]/80 backdrop-blur-2xl border border-white/15 shadow-[0_18px_40px_-12px_rgba(0,0,0,0.85),inset_0_1px_0_rgba(255,255,255,0.06)]">
      {tabs.map(t => {
        const Icon = t.icon;
        const isActive = currentTab === t.id;

        return (
          <button
            key={t.id}
            type="button"
            onClick={() => setCurrentTab(t.id)}
            className={`flex flex-col items-center justify-center gap-1 py-1 rounded-2xl transition-all cursor-pointer ${
              isActive ? 'text-white font-bold' : 'text-[#6f6a84] hover:text-[#9d98b0]'
            }`}
          >
            <Icon className={`w-5 h-5 transition-transform ${isActive ? 'text-[#34d399] scale-105' : ''}`} />
            <span className="text-[10px] tracking-tight">{t.label}</span>
            {isActive && (
              <span className="w-1 h-1 rounded-full bg-[#34d399] shadow-[0_0_6px_#34d399]" />
            )}
          </button>
        );
      })}
    </nav>
  );
};

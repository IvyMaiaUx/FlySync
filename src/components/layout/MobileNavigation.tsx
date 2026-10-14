import React from 'react';
import { useFlySync } from '../../store/FlySyncContext';
import { Plane, Wallet, Bell, Gift, Sparkles, ShieldCheck } from 'lucide-react';

interface MobileNavigationProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
}

export const MobileNavigation: React.FC<MobileNavigationProps> = ({ currentTab, setCurrentTab }) => {
  const { notifications, user, subscription } = useFlySync();
  const unreadCount = notifications.filter(n => n.status === 'unread').length;
  const isPremium = user.plan === 'premium' || subscription?.status === 'active';

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0E0324]/95 backdrop-blur-xl border-t border-purple-900/60 px-2 py-1 shadow-2xl safe-area-inset-bottom">
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {/* Tab 1: Radar (Supersonic Jet Cyan) */}
        <button
          onClick={() => setCurrentTab('radar')}
          className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-xl transition-all ${
            currentTab === 'radar'
              ? 'text-cyan-400 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="relative">
            <Plane className={`w-5 h-5 ${currentTab === 'radar' ? 'text-cyan-400 drop-shadow-[0_0_8px_rgba(56,189,248,0.7)]' : ''}`} />
            {currentTab === 'radar' && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-cyan-400" />
            )}
          </div>
          <span className="text-[10px] mt-1 tracking-tight">Radar</span>
        </button>

        {/* Tab 2: Carteira (Neon Ticket Green) */}
        <button
          onClick={() => setCurrentTab('wallet')}
          className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-xl transition-all ${
            currentTab === 'wallet'
              ? 'text-[#22C55E] font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="relative">
            <Wallet className={`w-5 h-5 ${currentTab === 'wallet' ? 'text-[#22C55E] drop-shadow-[0_0_8px_rgba(34,197,94,0.7)]' : ''}`} />
            {currentTab === 'wallet' && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#22C55E]" />
            )}
          </div>
          <span className="text-[10px] mt-1 tracking-tight">Carteira</span>
        </button>

        {/* Tab 3: Alertas */}
        <button
          onClick={() => setCurrentTab('alerts')}
          className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-xl transition-all relative ${
            currentTab === 'alerts'
              ? 'text-purple-300 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="relative">
            <Bell className={`w-5 h-5 ${currentTab === 'alerts' ? 'text-purple-300 drop-shadow-[0_0_8px_rgba(168,85,247,0.7)]' : ''}`} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-2 px-1 py-0.2 bg-[#22C55E] text-slate-950 text-[9px] font-black rounded-full tabular-nums">
                {unreadCount}
              </span>
            )}
            {currentTab === 'alerts' && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-purple-400" />
            )}
          </div>
          <span className="text-[10px] mt-1 tracking-tight">Alertas</span>
        </button>

        {/* Tab 4: Ganhar Milhas */}
        <button
          onClick={() => setCurrentTab('campaigns')}
          className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-xl transition-all ${
            currentTab === 'campaigns'
              ? 'text-emerald-400 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="relative">
            <Gift className={`w-5 h-5 ${currentTab === 'campaigns' ? 'text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.7)]' : ''}`} />
            {currentTab === 'campaigns' && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-emerald-400" />
            )}
          </div>
          <span className="text-[10px] mt-1 tracking-tight">Ganhar</span>
        </button>

        {/* Tab 5: Planos */}
        <button
          onClick={() => setCurrentTab('subscription')}
          className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-xl transition-all ${
            currentTab === 'subscription'
              ? 'text-amber-300 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="relative">
            <Sparkles className={`w-5 h-5 ${currentTab === 'subscription' ? 'text-amber-300 drop-shadow-[0_0_8px_rgba(252,211,77,0.7)]' : ''}`} />
            {isPremium && (
              <span className="absolute -top-1 -right-2 text-[8px] px-1 bg-emerald-500 text-slate-950 font-black rounded-sm uppercase">
                Pro
              </span>
            )}
            {currentTab === 'subscription' && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-amber-400" />
            )}
          </div>
          <span className="text-[10px] mt-1 tracking-tight">Planos</span>
        </button>

        {/* Admin (Only if Admin) */}
        {user.role === 'admin' && (
          <button
            onClick={() => setCurrentTab('admin')}
            className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-xl transition-all ${
              currentTab === 'admin'
                ? 'text-amber-400 font-bold'
                : 'text-amber-300/60 hover:text-amber-200'
            }`}
          >
            <ShieldCheck className="w-5 h-5" />
            <span className="text-[10px] mt-1 tracking-tight">Admin</span>
          </button>
        )}
      </div>
    </nav>
  );
};

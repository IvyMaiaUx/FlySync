import React, { useState } from 'react';
import { useFlySync } from '../../store/FlySyncContext';
import { isAdminEmail } from '../../lib/mappers';
import { Bell, BellRing, ShieldCheck, User, LogOut, Check, ChevronDown, Sparkles, Zap, Radio, Crown, Wallet } from 'lucide-react';
import { FlySyncLogo } from '../common/FlySyncLogo';
import { PWAInstallButton } from '../common/PWAInstallButton';

interface HeaderProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  openAuthModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({ currentTab, setCurrentTab, openAuthModal }) => {
  const { user, isAuthenticated, notifications, subscription, pushPermission, setIsPushModalOpen } = useFlySync();
  const [profileOpen, setProfileOpen] = useState(false);

  const unreadCount = notifications.filter(n => n.status === 'unread').length;
  const isPremium = user.plan === 'premium' || subscription?.status === 'active';

  return (
    <header className="sticky top-0 z-40 bg-[#100526]/95 backdrop-blur-md border-b border-purple-900/50 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-2 sm:gap-6 h-16 min-w-0">
          {/* Zone 1: Brand Wordmark with Official Vector Emblem */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0 min-w-0">
            <button
              onClick={() => setCurrentTab('home')}
              className="text-left focus:outline-hidden hover:opacity-95 transition-opacity"
            >
              <FlySyncLogo size="md" isDarkTheme={true} />
            </button>
          </div>

          {/* Zone 2: Mockup Top Navigation Links */}
          <nav className="hidden md:flex items-center gap-1.5 text-xs font-semibold">
            <button
              onClick={() => setCurrentTab('home')}
              className={`whitespace-nowrap shrink-0 transition-all px-3 py-1.5 rounded-lg ${
                currentTab === 'home'
                  ? 'bg-purple-900/60 text-white font-bold border-b-2 border-[#34d399] shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              Hoje
            </button>

            <button
              onClick={() => setCurrentTab('radar')}
              className={`whitespace-nowrap shrink-0 transition-all px-3 py-1.5 rounded-lg ${
                currentTab === 'radar'
                  ? 'bg-purple-900/60 text-white font-bold border-b-2 border-[#34d399] shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              Ofertas
            </button>

            <button
              onClick={() => setCurrentTab('search')}
              className={`whitespace-nowrap shrink-0 transition-all px-3 py-1.5 rounded-lg ${
                currentTab === 'search'
                  ? 'bg-purple-900/60 text-white font-bold border-b-2 border-[#34d399] shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              Buscar
            </button>

            <button
              onClick={() => setCurrentTab('campaigns')}
              className={`whitespace-nowrap shrink-0 transition-all px-3 py-1.5 rounded-lg ${
                currentTab === 'campaigns'
                  ? 'bg-purple-900/60 text-white font-bold border-b-2 border-[#34d399] shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              Ganhar
            </button>

            <button
              onClick={() => setCurrentTab('wallet')}
              className={`whitespace-nowrap shrink-0 transition-all px-3 py-1.5 rounded-lg ${
                currentTab === 'wallet'
                  ? 'bg-purple-900/60 text-white font-bold border-b-2 border-[#34d399] shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              Carteira
            </button>

            <button
              onClick={() => setCurrentTab('subscription')}
              className={`whitespace-nowrap shrink-0 transition-all px-3 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer ${
                currentTab === 'subscription'
                  ? 'bg-purple-900/60 text-white font-bold border-b-2 border-[#34d399] shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <span>Planos VIP</span>
              {isPremium ? (
                <span className="text-[9px] uppercase font-black tracking-wider bg-emerald-500 text-slate-950 px-1.5 py-0.5 rounded-sm">
                  PRO
                </span>
              ) : (
                <span className="text-[9px] uppercase font-black tracking-wider bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 px-1.5 py-0.5 rounded-sm flex items-center gap-0.5 shadow-xs">
                  <Crown className="w-2.5 h-2.5" />
                  <span>VIP</span>
                </span>
              )}
            </button>
          </nav>

          {/* Zone 3: 1 primary action or profile menu + PWA install */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0 relative">
            {/* PWA Install Button */}
            <PWAInstallButton />

            {/* Push Notification Manager Button (PRD 4.2) */}
            <button
              onClick={() => setIsPushModalOpen(true)}
              aria-label="Gerenciar alertas push em tempo real"
              className={`hidden sm:flex p-2 rounded-lg transition-all items-center gap-1.5 text-xs font-semibold ${
                pushPermission === 'granted'
                  ? 'text-[#22C55E] bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30'
                  : 'text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 animate-pulse'
              }`}
              title={pushPermission === 'granted' ? 'Alertas Push Ativos (Tempo Real)' : 'Ativar Alertas Push em Tempo Real'}
            >
              <BellRing className={`w-3.5 h-3.5 ${pushPermission === 'granted' ? 'fill-[#22C55E]' : ''}`} />
              <span className="hidden xl:inline text-[11px]">
                {pushPermission === 'granted' ? 'Push ON' : 'Ativar Push'}
              </span>
            </button>

            {/* Quick alert icon for direct access on tablet/desktop */}
            <button
              onClick={() => setCurrentTab('alerts')}
              aria-label="Ver notificações de alertas"
              className="hidden sm:flex relative p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#22C55E] rounded-full shadow-[0_0_8px_#22C55E]" />
              )}
            </button>

            {/* Profile Dropdown */}
            <div className="relative">
              {isAuthenticated ? (
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 p-1.5 pl-2 rounded-lg border border-purple-800/60 hover:border-purple-600 bg-purple-950/60 hover:bg-purple-900/60 transition-all text-xs text-white font-medium"
                >
                  <div className="w-6 h-6 rounded-md bg-gradient-to-tr from-purple-800 to-[#22C55E] text-slate-950 flex items-center justify-center font-black text-xs uppercase shadow-xs">
                    {user.displayName.charAt(0)}
                  </div>
                  <span className="hidden sm:inline max-w-[100px] truncate text-slate-200">{user.displayName}</span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>
              ) : (
                <button
                  onClick={openAuthModal}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#22C55E] hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-colors shadow-xs"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Entrar</span>
                </button>
              )}

              {profileOpen && isAuthenticated && (
                <div 
                  className="absolute right-0 mt-2 w-64 bg-[#14072B] rounded-xl shadow-2xl border border-purple-800/80 py-2 z-50 text-white animate-in fade-in zoom-in-95 duration-100"
                  onClick={() => setProfileOpen(false)}
                >
                  <div className="px-4 py-2 border-b border-purple-900/60">
                    <p className="text-xs font-semibold text-white">{user.displayName}</p>
                    <p className="text-[11px] text-purple-300 truncate">{user.email}</p>
                    <div className="mt-2 flex items-center justify-between text-xs">
                      <span className="text-purple-300">Plano:</span>
                      <span className={`font-bold ${isPremium ? 'text-emerald-400' : 'text-slate-300'}`}>
                        {isPremium ? 'FlySync Premium' : 'Free (Básico)'}
                      </span>
                    </div>
                    {(user.role === 'admin' || isAdminEmail(user.email)) && (
                      <div className="mt-1 flex items-center justify-between text-xs">
                        <span className="text-purple-300">Acesso:</span>
                        <span className="font-bold text-amber-300">Administrador</span>
                      </div>
                    )}
                  </div>

                  <div className="py-1">
                    <button
                      onClick={() => {
                        setCurrentTab('profile');
                        setProfileOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-[#34d399] font-medium hover:bg-purple-900/40 flex items-center gap-2"
                    >
                      <User className="w-3.5 h-3.5 text-[#34d399]" />
                      Meu Perfil & Preferências
                    </button>
                    <button
                      onClick={() => {
                        setCurrentTab('wallet');
                        setProfileOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-slate-200 hover:bg-purple-900/40 flex items-center gap-2"
                    >
                      <Wallet className="w-3.5 h-3.5 text-purple-400" />
                      Minha Carteira
                    </button>
                    <button
                      onClick={() => setIsPushModalOpen(true)}
                      className="w-full text-left px-4 py-2 text-xs text-slate-200 hover:bg-purple-900/40 flex items-center gap-2"
                    >
                      <BellRing className="w-3.5 h-3.5 text-[#38BDF8]" />
                      Gerenciador de Push
                    </button>
                    <button
                      onClick={() => setCurrentTab('subscription')}
                      className="w-full text-left px-4 py-2 text-xs text-slate-200 hover:bg-purple-900/40 flex items-center gap-2"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-[#22C55E]" />
                      {isPremium ? 'Gerenciar Assinatura' : 'Assinar Premium (R$ 29,90)'}
                    </button>
                    {(user.role === 'admin' || isAdminEmail(user.email)) && (
                      <button
                        onClick={() => {
                          window.location.hash = '#/admin';
                          setProfileOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-xs text-amber-300 hover:bg-amber-950/40 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                          <span>Portal Admin</span>
                        </div>
                        <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded font-bold">Backoffice</span>
                      </button>
                    )}
                  </div>

                  <div className="border-t border-purple-900/60 mt-2 pt-1">
                    <button
                      onClick={openAuthModal}
                      className="w-full text-left px-4 py-2 text-xs text-rose-400 hover:bg-rose-500/10 flex items-center gap-2"
                    >
                      <LogOut className="w-3.5 h-3.5 text-rose-400" />
                      Conta & Sessão
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile nav bar is now in MobileNavigation bottom component for native PWA thumb reachability */}
    </header>
  );
};

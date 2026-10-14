import React, { useState } from 'react';
import { useFlySync } from '../../store/FlySyncContext';
import { NewSearchModal } from './NewSearchModal';
import { PushNotificationManagerCard } from '../notifications/PushNotificationManagerCard';
import { PLANS } from '../../data/initialData';
import {
  Bell,
  BellRing,
  Plus,
  Trash2,
  Power,
  CheckCircle,
  Sparkles,
  Play,
  Mail,
  MessageSquare,
  Smartphone,
  ExternalLink,
  Sliders,
  Zap,
  Volume2
} from 'lucide-react';

interface AlertsViewProps {
  onOpenUpgrade: () => void;
  onOpenOffer: (offerId: string) => void;
}

export const AlertsView: React.FC<AlertsViewProps> = ({ onOpenUpgrade, onOpenOffer }) => {
  const {
    user,
    programs,
    savedSearches,
    notifications,
    toggleSavedSearch,
    deleteSavedSearch,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    runAlertMatcher,
    updatePreferences,
    toggleRoutePush,
    testPushNotification,
    setIsPushModalOpen,
    openPushModalForRoute,
    pushPermission
  } = useFlySync();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [matchRunFeedback, setMatchRunFeedback] = useState<string | null>(null);

  const currentPlan = PLANS[user.plan];
  const activeCount = savedSearches.filter(s => s.isActive).length;
  const isPremium = user.plan === 'premium';

  const handleRunManualMatcher = async () => {
    const matched = await runAlertMatcher();
    if (matched > 0) {
      setMatchRunFeedback(`Encontramos ${matched} ${matched === 1 ? 'nova oferta' : 'novas ofertas'} para seus alertas!`);
    } else {
      setMatchRunFeedback('Nenhuma oferta nova por enquanto. A gente te avisa quando aparecer.');
    }
    setTimeout(() => setMatchRunFeedback(null), 6000);
  };

  const formatDate = (isoStr: string) => {
    try {
      return new Date(isoStr).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return isoStr;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-150 text-white">
      {/* View Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-purple-900/40">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Meus Alertas
          </h1>
          <p className="text-sm text-slate-300 mt-1 max-w-2xl">
            Escolha as rotas que te interessam e avisamos quando aparecer passagem dentro do seu limite de milhas.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          <button
            onClick={handleRunManualMatcher}
            className="px-3.5 py-2 text-xs font-semibold text-slate-200 bg-[#160833] border border-purple-800/60 hover:bg-purple-900/40 hover:text-white rounded-lg transition-colors flex items-center gap-1.5"
            title="Executa a verificação das buscas salvas contra as ofertas do radar"
          >
            <Play className="w-3.5 h-3.5 text-[#22C55E] fill-[#22C55E]" />
            <span>Verificar Agora</span>
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 text-xs font-bold text-slate-950 bg-[#22C55E] hover:bg-emerald-400 rounded-lg shadow-[0_0_15px_rgba(34,197,94,0.3)] transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Nova Rota Monitorada</span>
          </button>
        </div>
      </div>

      {/* Match Feedback Notification */}
      {matchRunFeedback && (
        <div className="p-4 rounded-xl bg-purple-950/80 border border-purple-700 text-xs text-purple-200 flex items-start gap-2.5 animate-in fade-in">
          <CheckCircle className="w-4 h-4 text-[#22C55E] shrink-0 mt-0.5" />
          <p className="leading-relaxed">{matchRunFeedback}</p>
        </div>
      )}

      {/* PRD 4.2: Gerenciador de Permissões de Notificações Push & Alertas em Tempo Real */}
      <PushNotificationManagerCard />

      {/* Quota & Plan Status Card (RN10) */}
      <div className="p-5 rounded-2xl bg-[#13062C] border border-purple-900/60 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Capacidade do Seu Plano:
            </span>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-sm ${isPremium ? 'bg-emerald-500/20 text-[#22C55E] border border-emerald-500/40' : 'bg-purple-950 text-purple-200 border border-purple-800'}`}>
              {currentPlan.name}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-2xl font-black text-white font-mono tabular-nums">
              {activeCount} <span className="text-sm font-normal text-slate-400">de {currentPlan.maxSavedSearches} ativas</span>
            </div>
            <div className="w-36 h-2 bg-purple-950 rounded-full overflow-hidden border border-purple-900">
              <div
                className={`h-full rounded-full ${isPremium ? 'bg-gradient-to-r from-[#22C55E] to-[#38BDF8]' : 'bg-[#22C55E]'}`}
                style={{ width: `${Math.min(100, (activeCount / currentPlan.maxSavedSearches) * 100)}%` }}
              />
            </div>
          </div>
        </div>

        {!isPremium && (
          <div className="flex items-center gap-3 sm:border-l sm:border-purple-900/60 sm:pl-6">
            <div className="text-xs text-slate-300 hidden lg:block">
              Precisa monitorar mais rotas e receber alertas instantâneos?
            </div>
            <button
              onClick={onOpenUpgrade}
              className="px-4 py-2 text-xs font-bold text-[#22C55E] bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Ampliar para 15 Rotas (Premium)</span>
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (2/3): Saved Searches List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white">
              Rotas Monitoradas Atualmente ({savedSearches.length})
            </h2>
            <span className="text-xs text-slate-400">
              Ative ou pause conforme sua conveniência
            </span>
          </div>

          {savedSearches.length === 0 ? (
            <div className="p-8 text-center rounded-2xl bg-[#13062C] border border-purple-900/60">
              <Bell className="w-8 h-8 text-slate-500 mx-auto mb-2" />
              <h3 className="text-xs font-bold text-slate-200">Nenhuma rota monitorada</h3>
              <p className="text-xs text-slate-400 max-w-xs mx-auto mt-1 mb-3">
                Cadastre sua primeira rota (ex: GRU para MIA ou GIG para MAD) para ser avisado assim que o valor baixar.
              </p>
              <button
                onClick={() => setIsModalOpen(true)}
                className="px-3.5 py-1.5 text-xs font-bold text-slate-950 bg-[#22C55E] rounded-lg"
              >
                Cadastrar Rota
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {savedSearches.map((search) => {
                const prog = programs.find(p => p.id === search.programId);
                const isPushOn = search.pushEnabled !== false;

                return (
                  <div
                    key={search.id}
                    className={`p-4 rounded-2xl bg-[#13062C] border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                      search.isActive
                        ? 'border-purple-900/60 hover:border-[#22C55E]/50 shadow-md'
                        : 'border-purple-950/60 bg-[#0E0324]/60 opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-[#1F0A44] border border-purple-800 text-[#38BDF8] flex flex-col items-center justify-center font-mono font-bold text-xs shrink-0">
                        <span>{search.origin}</span>
                        <span className="text-[9px] text-[#22C55E] leading-none">➔ {search.destination}</span>
                      </div>

                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-xs font-bold text-white">{search.title}</h4>
                          <span className={`text-[10px] font-semibold px-1.5 py-0.2 rounded-sm ${search.isActive ? 'bg-emerald-500/20 text-[#22C55E]' : 'bg-purple-950 text-slate-400'}`}>
                            {search.isActive ? 'Ativo' : 'Pausado'}
                          </span>

                          {/* PRD 4.2 Channel Badge */}
                          <button
                            onClick={() => toggleRoutePush(search.id)}
                            className={`text-[10px] font-bold px-1.5 py-0.2 rounded-sm flex items-center gap-1 transition-colors ${
                              isPushOn && search.isActive
                                ? 'bg-[#22C55E]/20 text-[#22C55E] border border-emerald-500/40 hover:bg-[#22C55E]/30'
                                : 'bg-purple-950 text-slate-500 border border-purple-900 hover:text-slate-300'
                            }`}
                            title={isPushOn ? 'Push ativo para esta rota (clique para pausar)' : 'Ativar push para esta rota'}
                          >
                            <BellRing className={`w-2.5 h-2.5 ${isPushOn ? 'fill-[#22C55E]' : ''}`} />
                            <span>{isPushOn ? 'Push ON' : 'Push OFF'}</span>
                          </button>
                        </div>

                        <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-1 flex-wrap">
                          <span>Teto: <strong className="font-mono text-white">{search.maxMiles.toLocaleString('pt-BR')}</strong> {prog?.unitLabel || 'milhas'}</span>
                          <span>·</span>
                          <span>{prog ? prog.name : 'Qualquer programa'}</span>
                          {search.cabinClass && (
                            <>
                              <span>·</span>
                              <span className="capitalize">{search.cabinClass}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                      <button
                        onClick={() => openPushModalForRoute(search.origin, search.destination, search.maxMiles)}
                        className="px-2 py-1 text-[11px] font-semibold text-slate-300 hover:text-white bg-[#190938] hover:bg-purple-900/60 border border-purple-800/60 rounded-lg transition-colors flex items-center gap-1"
                        title="Configurações de canal de alerta (Push, WhatsApp, E-mail)"
                      >
                        <Sliders className="w-3 h-3 text-[#22C55E]" />
                        <span className="hidden md:inline">Canais</span>
                      </button>

                      <button
                        onClick={() => testPushNotification(`${search.origin} ➔ ${search.destination}`)}
                        className="px-2 py-1 text-[11px] font-semibold text-slate-300 hover:text-white bg-[#190938] hover:bg-purple-900/60 border border-purple-800/60 rounded-lg transition-colors flex items-center gap-1"
                        title="Simular disparo de teste para esta rota"
                      >
                        <Zap className="w-3 h-3 text-[#38BDF8]" />
                        <span className="hidden md:inline">Testar</span>
                      </button>

                      <button
                        onClick={() => toggleSavedSearch(search.id)}
                        className={`p-1.5 rounded-lg text-xs font-medium transition-colors ${
                          search.isActive
                            ? 'text-slate-400 hover:text-white hover:bg-white/5'
                            : 'text-[#22C55E] bg-emerald-500/10 hover:bg-emerald-500/20'
                        }`}
                        title={search.isActive ? 'Pausar monitoramento' : 'Ativar monitoramento'}
                      >
                        <Power className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => deleteSavedSearch(search.id)}
                        className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                        title="Excluir alerta"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Preferences Box */}
          <div className="p-4 rounded-2xl bg-[#13062C] border border-purple-900/60 mt-6 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-white">
                Canais e Preferências de Notificação (Requisito 4.2)
              </h3>
              <button
                onClick={() => setIsPushModalOpen(true)}
                className="text-[11px] text-[#38BDF8] hover:underline font-semibold flex items-center gap-1"
              >
                <Sliders className="w-3 h-3" />
                <span>Painel Avançado de Push</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-300">
              {/* Push Web/App */}
              <label className="flex items-center gap-2 p-2.5 rounded-xl border border-purple-900/60 bg-[#1A0B3B]/60 cursor-pointer">
                <input
                  type="checkbox"
                  checked={user.preferences.pushAlerts}
                  onChange={(e) => updatePreferences({ pushAlerts: e.target.checked })}
                  className="rounded-sm text-[#22C55E] focus:ring-[#22C55E]"
                />
                <Smartphone className="w-3.5 h-3.5 text-[#22C55E]" />
                <span className="flex items-center gap-1">
                  <span>Push no Dispositivo</span>
                  <span className={`text-[9px] font-bold px-1 rounded-xs ${pushPermission === 'granted' ? 'bg-emerald-500/20 text-[#22C55E]' : 'bg-amber-500/20 text-amber-300'}`}>
                    {pushPermission === 'granted' ? 'Ativo' : 'Pendente'}
                  </span>
                </span>
              </label>

              {/* In-App Alerts */}
              <label className="flex items-center gap-2 p-2.5 rounded-xl border border-purple-900/60 bg-[#1A0B3B]/60 cursor-pointer">
                <input
                  type="checkbox"
                  checked={user.preferences.inAppAlerts}
                  onChange={(e) => updatePreferences({ inAppAlerts: e.target.checked })}
                  className="rounded-sm text-[#22C55E] focus:ring-[#22C55E]"
                />
                <Bell className="w-3.5 h-3.5 text-[#38BDF8]" />
                <span className="truncate">Notificações In-App (Feed)</span>
              </label>

              {/* Sound Alerts */}
              <label className="flex items-center gap-2 p-2.5 rounded-xl border border-purple-900/60 bg-[#1A0B3B]/60 cursor-pointer">
                <input
                  type="checkbox"
                  checked={user.preferences.soundEnabled}
                  onChange={(e) => updatePreferences({ soundEnabled: e.target.checked })}
                  className="rounded-sm text-[#22C55E] focus:ring-[#22C55E]"
                />
                <Volume2 className="w-3.5 h-3.5 text-amber-400" />
                <span className="flex items-center gap-1">
                  Som de Notificação
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Right Column (1/3): Notification Inbox */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white">
              Notificações de Alertas ({notifications.length})
            </h2>
            {notifications.some(n => n.status === 'unread') && (
              <button
                onClick={markAllNotificationsAsRead}
                className="text-[11px] font-semibold text-[#22C55E] hover:underline"
              >
                Marcar lidas
              </button>
            )}
          </div>

          {notifications.length === 0 ? (
            <div className="p-8 text-center rounded-2xl bg-[#13062C] border border-purple-900/60 text-xs text-slate-400">
              Nenhuma notificação recente.
            </div>
          ) : (
            <div className="space-y-2.5">
              {notifications.map((notif) => {
                const isUnread = notif.status === 'unread';

                return (
                  <div
                    key={notif.id}
                    onClick={() => {
                      markNotificationAsRead(notif.id);
                      if (notif.offerId) onOpenOffer(notif.offerId);
                    }}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                      isUnread
                        ? 'bg-[#1D0C42] border-[#22C55E]/50 hover:border-[#22C55E] shadow-[0_0_15px_rgba(34,197,94,0.1)]'
                        : 'bg-[#13062C] border-purple-900/60 hover:border-purple-700'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        {isUnread && (
                          <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] shrink-0" />
                        )}
                        <h4 className="text-xs font-bold text-white">{notif.title}</h4>
                      </div>
                      <span className="text-[10px] text-slate-400 whitespace-nowrap">
                        {formatDate(notif.sentAt)}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                      {notif.message}
                    </p>

                    <div className="mt-2 pt-2 border-t border-purple-900/40 flex items-center justify-between text-[11px]">
                      <span className="text-[#22C55E] font-semibold flex items-center gap-1">
                        Ver oferta no radar
                        <ExternalLink className="w-3 h-3" />
                      </span>
                      <span className="text-slate-400 capitalize">Canal: {notif.channel}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <NewSearchModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onOpenUpgrade={onOpenUpgrade}
      />
    </div>
  );
};

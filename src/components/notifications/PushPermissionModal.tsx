import React, { useState } from 'react';
import { useFlySync } from '../../store/FlySyncContext';
import { Modal } from '../common/Modal';
import {
  Bell,
  BellRing,
  ShieldCheck,
  AlertTriangle,
  CheckCircle,
  Volume2,
  VolumeX,
  Smartphone,
  Sparkles,
  Zap,
  HelpCircle,
  Clock,
  ExternalLink,
  ChevronRight,
  Radio,
  Sliders,
  Plane,
  RefreshCw,
  Layers
} from 'lucide-react';
import { AlertChannelSettings } from './AlertChannelSettings';

export const PushPermissionModal: React.FC = () => {
  const {
    isPushModalOpen,
    setIsPushModalOpen,
    pushModalPreset,
    pushPermission,
    requestPushPermission,
    testPushNotification,
    user,
    updatePreferences,
    savedSearches,
    toggleRoutePush,
    updateRouteNotificationSettings,
    addSavedSearch,
    programs
  } = useFlySync();

  const [testFeedback, setTestFeedback] = useState<{ type: 'success' | 'info' | 'error'; text: string } | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [showTroubleshooting, setShowTroubleshooting] = useState(false);
  const [activeTab, setActiveTab] = useState<'channels' | 'preferences'>('channels');

  const matchingPresetSearch = pushModalPreset
    ? savedSearches.find(
        s => s.origin.toUpperCase() === pushModalPreset.origin?.toUpperCase() &&
             s.destination.toUpperCase() === pushModalPreset.dest?.toUpperCase()
      )
    : undefined;

  if (!isPushModalOpen) return null;

  const handleRequestPermission = async () => {
    const status = await requestPushPermission();
    if (status === 'granted') {
      setTestFeedback({
        type: 'success',
        text: 'Permissão concedida com sucesso! Alertas em tempo real ativados para suas rotas no Radar.'
      });
    } else if (status === 'denied') {
      setTestFeedback({
        type: 'error',
        text: 'A permissão foi bloqueada no navegador. Siga as orientações abaixo para desbloquear.'
      });
      setShowTroubleshooting(true);
    }
  };

  const handleRunTest = async (route?: string) => {
    setIsTesting(true);
    try {
      const res = await testPushNotification(route);
      setTestFeedback({
        type: 'success',
        text: res.message
      });
    } catch {
      setTestFeedback({
        type: 'error',
        text: 'Não foi possível disparar a notificação de teste.'
      });
    } finally {
      setIsTesting(false);
      setTimeout(() => setTestFeedback(null), 8000);
    }
  };

  const handleQuickAddPresetRoute = () => {
    if (!pushModalPreset || !pushModalPreset.origin || !pushModalPreset.dest) return;

    addSavedSearch({
      title: `${pushModalPreset.origin} para ${pushModalPreset.dest}`,
      origin: pushModalPreset.origin,
      destination: pushModalPreset.dest,
      maxMiles: pushModalPreset.maxMiles || 50000,
      pushEnabled: true,
      emailEnabled: true,
      whatsappEnabled: user.preferences.whatsappAlerts,
      alertFrequency: 'immediate'
    });

    setTestFeedback({
      type: 'success',
      text: `Rota ${pushModalPreset.origin} ➔ ${pushModalPreset.dest} adicionada com monitoramento Push em tempo real!`
    });
  };

  const isPresetAlreadySaved = pushModalPreset && savedSearches.some(
    s => s.origin.toUpperCase() === pushModalPreset.origin?.toUpperCase() &&
         s.destination.toUpperCase() === pushModalPreset.dest?.toUpperCase()
  );

  return (
    <Modal
      isOpen={isPushModalOpen}
      onClose={() => setIsPushModalOpen(false)}
      title="Notificações no celular"
      subtitle="Seja avisado na hora quando aparecer passagem nas suas rotas."
      size="xl"
    >
      <div className="space-y-6 text-slate-200">
        {/* Status Header Banner */}
        <div className={`p-4 sm:p-5 rounded-2xl border transition-all ${
          pushPermission === 'granted'
            ? 'bg-emerald-950/40 border-[#22C55E]/60 text-emerald-100 shadow-[0_0_20px_rgba(34,197,94,0.15)]'
            : pushPermission === 'denied'
            ? 'bg-rose-950/40 border-rose-500/60 text-rose-100'
            : 'bg-purple-950/60 border-purple-700/80 text-purple-100'
        }`}>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5 min-w-0 flex-1">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                pushPermission === 'granted'
                  ? 'bg-[#22C55E] text-slate-950 shadow-md'
                  : pushPermission === 'denied'
                  ? 'bg-rose-500 text-white'
                  : 'bg-purple-800 text-[#38BDF8]'
              }`}>
                {pushPermission === 'granted' ? (
                  <BellRing className="w-5 h-5 stroke-[2.5]" />
                ) : pushPermission === 'denied' ? (
                  <AlertTriangle className="w-5 h-5 stroke-[2.5]" />
                ) : (
                  <Bell className="w-5 h-5" />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-sm font-bold text-white leading-tight">
                    {pushPermission === 'granted' && 'Notificações Push Nativas Concedidas'}
                    {pushPermission === 'denied' && 'Notificações Bloqueadas no Navegador'}
                    {pushPermission === 'default' && 'Permissão de Notificação Push Pendente'}
                    {pushPermission === 'unsupported' && 'Navegador Sem Suporte a Web Push'}
                  </h3>
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full shrink-0 ${
                    pushPermission === 'granted'
                      ? 'bg-[#22C55E]/20 text-[#22C55E] border border-[#22C55E]/40'
                      : pushPermission === 'denied'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  }`}>
                    {pushPermission === 'granted' ? 'Ativo' : pushPermission === 'denied' ? 'Bloqueado' : 'Aguardando Ativação'}
                  </span>
                </div>

                <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                  {pushPermission === 'granted' && (
                    'O FlySync está conectado em tempo real para enviar alertas no seu celular ou desktop no instante em que as companhias liberarem novas vagas.'
                  )}
                  {pushPermission === 'denied' && (
                    'O seu navegador bloqueou os alertas. Para ser avisado sobre quedas de preço antes que as passagens esgotem, libere as permissões do site.'
                  )}
                  {pushPermission === 'default' && (
                    'Ative as notificações para receber alertas instantâneos de rotas promocionais diretamente no seu celular ou computador.'
                  )}
                  {pushPermission === 'unsupported' && (
                    'Seu navegador atual não dá suporte à API de Notificações, mas você continuará recebendo alertas via E-mail e WhatsApp.'
                  )}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 shrink-0 self-start md:self-center pt-1 md:pt-0">
              {pushPermission === 'default' && (
                <button
                  onClick={handleRequestPermission}
                  className="px-4 py-2 text-xs font-bold text-slate-950 bg-[#22C55E] hover:bg-emerald-400 rounded-xl shadow-[0_0_15px_rgba(34,197,94,0.4)] transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                >
                  <Zap className="w-4 h-4 fill-slate-950" />
                  <span>Conceder Permissão</span>
                </button>
              )}

              {pushPermission === 'denied' && (
                <button
                  onClick={() => setShowTroubleshooting(!showTroubleshooting)}
                  className="px-3 py-1.5 text-xs font-semibold text-rose-200 bg-rose-900/40 hover:bg-rose-900/60 border border-rose-700/60 rounded-xl transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>Como Desbloquear</span>
                </button>
              )}

              <button
                onClick={() => handleRunTest()}
                disabled={isTesting}
                className="px-3.5 py-2 text-xs font-semibold text-slate-200 hover:text-white bg-[#160833] hover:bg-purple-900/60 border border-purple-800/80 rounded-xl transition-colors flex items-center gap-1.5 shadow-sm whitespace-nowrap cursor-pointer"
                title="Dispara um alerta sonoro e notificação de teste"
              >
                {isTesting ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#38BDF8]" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5 text-[#38BDF8]" />
                )}
                <span>Testar Notificação</span>
              </button>
            </div>
          </div>
        </div>

        {/* Feedback message banner */}
        {testFeedback && (
          <div className={`p-3.5 rounded-xl border text-xs flex items-center gap-2.5 animate-in fade-in ${
            testFeedback.type === 'success'
              ? 'bg-emerald-950/60 border-emerald-500/60 text-emerald-200'
              : testFeedback.type === 'error'
              ? 'bg-rose-950/60 border-rose-500/60 text-rose-200'
              : 'bg-purple-950/60 border-purple-500/60 text-purple-200'
          }`}>
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span className="leading-relaxed">{testFeedback.text}</span>
          </div>
        )}

        {/* Step-by-step unblocking guide (if denied or troubleshooting requested) */}
        {(showTroubleshooting || pushPermission === 'denied') && (
          <div className="p-4 rounded-2xl bg-[#160833] border border-rose-900/60 space-y-3 animate-in fade-in">
            <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#38BDF8]" />
              Como liberar as Notificações no seu Navegador:
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-300">
              <div className="p-2.5 rounded-xl bg-[#1D0C42] border border-purple-800/60">
                <strong className="block text-white font-semibold mb-1">Google Chrome / Brave</strong>
                <ol className="list-decimal list-inside space-y-1 text-[11px] text-slate-400">
                  <li>Clique no ícone de <strong>Cadeado / Ajustes</strong> à esquerda da URL</li>
                  <li>Localize <strong>Notificações</strong></li>
                  <li>Alterne para <strong>Permitir</strong> e recarregue</li>
                </ol>
              </div>

              <div className="p-2.5 rounded-xl bg-[#1D0C42] border border-purple-800/60">
                <strong className="block text-white font-semibold mb-1">Safari (macOS / iOS)</strong>
                <ol className="list-decimal list-inside space-y-1 text-[11px] text-slate-400">
                  <li>Menu Safari &gt; <strong>Ajustes deste Site</strong></li>
                  <li>Ou em iOS: Adicione à <strong>Tela de Início (PWA)</strong></li>
                  <li>Ative as notificações nas Preferências</li>
                </ol>
              </div>

              <div className="p-2.5 rounded-xl bg-[#1D0C42] border border-purple-800/60">
                <strong className="block text-white font-semibold mb-1">Microsoft Edge / Firefox</strong>
                <ol className="list-decimal list-inside space-y-1 text-[11px] text-slate-400">
                  <li>Clique no ícone de <strong>Permissões</strong> na barra de endereços</li>
                  <li>Ative o botão de <strong>Notificações</strong></li>
                  <li>Clique em <strong>Testar</strong> para confirmar</li>
                </ol>
              </div>
            </div>
          </div>
        )}

        {/* Preset Route Banner if launched from a Radar Route */}
        {pushModalPreset && pushModalPreset.origin && pushModalPreset.dest && (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/80 to-[#190838] border border-purple-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#220B4E] border border-purple-600 flex items-center justify-center text-[#38BDF8] font-mono font-black text-xs shrink-0">
                <Plane className="w-5 h-5 text-[#22C55E]" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-purple-300 block">
                  Rota Selecionada no Radar
                </span>
                <h4 className="text-sm font-black text-white font-mono">
                  {pushModalPreset.origin} ➔ {pushModalPreset.dest}
                </h4>
                <p className="text-xs text-slate-300">
                  Teto sugerido: {pushModalPreset.maxMiles?.toLocaleString('pt-BR')} milhas
                </p>
              </div>
            </div>

            {isPresetAlreadySaved ? (
              <span className="text-xs font-bold text-[#22C55E] flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                <CheckCircle className="w-4 h-4" />
                <span>Rota já monitorada</span>
              </span>
            ) : (
              <button
                onClick={handleQuickAddPresetRoute}
                className="px-4 py-2 text-xs font-bold text-slate-950 bg-[#22C55E] hover:bg-emerald-400 rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
              >
                <BellRing className="w-4 h-4 fill-slate-950" />
                <span>Ativar Alerta Push Nesta Rota</span>
              </button>
            )}
          </div>
        )}

        {/* Navigation Tabs between Channel Settings and Permissions/Audio */}
        <div className="flex items-center gap-2 border-b border-purple-900/60 pb-1">
          <button
            type="button"
            onClick={() => setActiveTab('channels')}
            className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'channels'
                ? 'bg-[#22C55E]/20 text-[#22C55E] border border-[#22C55E]/50 shadow-[0_0_15px_rgba(34,197,94,0.15)]'
                : 'text-slate-400 hover:text-white hover:bg-purple-900/30'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Canais por Rota no Radar</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-purple-950 border border-purple-800 text-[#38BDF8]">
              {savedSearches.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('preferences')}
            className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'preferences'
                ? 'bg-purple-600/30 text-purple-200 border border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.15)]'
                : 'text-slate-400 hover:text-white hover:bg-purple-900/30'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Permissões & Ajustes Globais</span>
          </button>
        </div>

        {/* Tab 1: Configurações de Canal de Alerta (Push, WhatsApp, E-mail) - Requisito 6 */}
        {activeTab === 'channels' && (
          <AlertChannelSettings highlightSearchId={matchingPresetSearch?.id} />
        )}

        {/* Tab 2: Permissões & Ajustes Globais */}
        {activeTab === 'preferences' && (
          <div className="space-y-5 animate-in fade-in">
            {/* Global Alert Preferences Grid (PRD 4.2) */}
            <div className="p-4 rounded-2xl bg-[#13062C] border border-purple-900/60 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Sliders className="w-4 h-4 text-[#22C55E]" />
                  Preferências Padrão de Disparo
                </h4>
                <span className="text-[11px] text-slate-400">
                  Aplicado para novas rotas adicionadas
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Push Global Switch */}
                <div className="p-3.5 rounded-xl bg-[#180838] border border-purple-800/60 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-white flex items-center gap-1.5">
                        <Smartphone className="w-3.5 h-3.5 text-[#38BDF8]" />
                        Push no Dispositivo
                      </span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={user.preferences.pushAlerts}
                          onChange={(e) => updatePreferences({ pushAlerts: e.target.checked })}
                          className="sr-only peer"
                        />
                        <div className="w-8 h-4 bg-purple-950 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[1px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-[#22C55E]"></div>
                      </label>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-tight">
                      Disparo imediato ao vivo para alertas no celular ou PC.
                    </p>
                  </div>
                </div>

                {/* Audio Alert Switch */}
                <div className="p-3.5 rounded-xl bg-[#180838] border border-purple-800/60 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-white flex items-center gap-1.5">
                        {user.preferences.soundEnabled ? (
                          <Volume2 className="w-3.5 h-3.5 text-[#22C55E]" />
                        ) : (
                          <VolumeX className="w-3.5 h-3.5 text-slate-400" />
                        )}
                        Alerta Sonoro
                      </span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={user.preferences.soundEnabled}
                          onChange={(e) => updatePreferences({ soundEnabled: e.target.checked })}
                          className="sr-only peer"
                        />
                        <div className="w-8 h-4 bg-purple-950 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[1px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-[#22C55E]"></div>
                      </label>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-tight">
                      Toca aviso harmônico sintético ao registrar baixa.
                    </p>
                  </div>
                </div>

                {/* Frequency Selector */}
                <div className="p-3.5 rounded-xl bg-[#180838] border border-purple-800/60 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-white flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-amber-400" />
                        Frequência Padrão
                      </span>
                    </div>
                    <select
                      value={user.preferences.frequency}
                      onChange={(e) => updatePreferences({ frequency: e.target.value as any })}
                      className="w-full text-[11px] bg-[#110528] text-white border border-purple-700/60 rounded-lg p-1.5 focus:ring-1 focus:ring-[#22C55E]"
                    >
                      <option value="immediate">Imediato (Sem Latência)</option>
                      <option value="daily">Resumo Diário</option>
                      <option value="weekly">Resumo Semanal</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer actions */}
        <div className="pt-3 border-t border-purple-900/50 flex items-center justify-between text-xs">
          <span className="text-slate-400 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-[#22C55E]" />
            Em conformidade com a LGPD e W3C Push API
          </span>

          <button
            onClick={() => setIsPushModalOpen(false)}
            className="px-4 py-2 text-xs font-bold text-slate-950 bg-[#22C55E] hover:bg-emerald-400 rounded-xl transition-all shadow-sm"
          >
            Concluir & Salvar
          </button>
        </div>
      </div>
    </Modal>
  );
};

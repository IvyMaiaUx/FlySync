import React, { useState } from 'react';
import { useFlySync } from '../../store/FlySyncContext';
import { SavedSearch } from '../../types';
import {
  Bell,
  BellRing,
  Mail,
  MessageCircle,
  Smartphone,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Clock,
  Sparkles,
  TrendingDown,
  Sliders,
  ChevronDown,
  ChevronUp,
  Shield,
  Plane,
  Check,
  Send,
  Layers,
  Edit2
} from 'lucide-react';

interface AlertChannelSettingsProps {
  /** Optional filter for a specific route ID to auto-expand */
  highlightSearchId?: string;
}

export const AlertChannelSettings: React.FC<AlertChannelSettingsProps> = ({
  highlightSearchId
}) => {
  const {
    savedSearches,
    updateRouteNotificationSettings,
    pushPermission,
    requestPushPermission,
    testPushNotification,
    user,
    programs
  } = useFlySync();

  const [expandedId, setExpandedId] = useState<string | null>(
    highlightSearchId || (savedSearches.length > 0 ? savedSearches[0].id : null)
  );
  const [testingRouteId, setTestingRouteId] = useState<string | null>(null);
  const [routeTestFeedback, setRouteTestFeedback] = useState<{ id: string; msg: string; type: 'success' | 'info' | 'error' } | null>(null);

  if (savedSearches.length === 0) {
    return (
      <div className="p-6 rounded-2xl bg-[#14062E] border border-purple-900/60 text-center">
        <Plane className="w-8 h-8 text-purple-400 mx-auto mb-2 opacity-60" />
        <h4 className="text-sm font-bold text-white mb-1">Nenhuma rota monitorada no Radar</h4>
        <p className="text-xs text-slate-400 max-w-sm mx-auto">
          Adicione uma rota no Radar para habilitar o envio multicanal (Push, WhatsApp e E-mail).
        </p>
      </div>
    );
  }

  const handleToggleChannel = (
    search: SavedSearch,
    channel: 'push' | 'whatsapp' | 'email'
  ) => {
    if (channel === 'push') {
      const nextPush = search.pushEnabled === false ? true : false;
      // If turning on push and permission is default, prompt permission
      if (nextPush && pushPermission === 'default') {
        requestPushPermission();
      }
      updateRouteNotificationSettings(search.id, { pushEnabled: nextPush });
    } else if (channel === 'whatsapp') {
      const nextWhatsApp = search.whatsappEnabled === true ? false : true;
      updateRouteNotificationSettings(search.id, { whatsappEnabled: nextWhatsApp });
    } else if (channel === 'email') {
      const nextEmail = search.emailEnabled === false ? true : false;
      updateRouteNotificationSettings(search.id, { emailEnabled: nextEmail });
    }
  };

  const handleApplyPreset = (
    searchId: string,
    preset: 'all' | 'push_only' | 'push_wa' | 'mute'
  ) => {
    if (preset === 'all') {
      if (pushPermission === 'default') requestPushPermission();
      updateRouteNotificationSettings(searchId, {
        pushEnabled: true,
        whatsappEnabled: true,
        emailEnabled: true
      });
    } else if (preset === 'push_only') {
      if (pushPermission === 'default') requestPushPermission();
      updateRouteNotificationSettings(searchId, {
        pushEnabled: true,
        whatsappEnabled: false,
        emailEnabled: false
      });
    } else if (preset === 'push_wa') {
      if (pushPermission === 'default') requestPushPermission();
      updateRouteNotificationSettings(searchId, {
        pushEnabled: true,
        whatsappEnabled: true,
        emailEnabled: false
      });
    } else if (preset === 'mute') {
      updateRouteNotificationSettings(searchId, {
        pushEnabled: false,
        whatsappEnabled: false,
        emailEnabled: false
      });
    }
  };

  const handleTestRouteChannels = async (search: SavedSearch) => {
    setTestingRouteId(search.id);
    setRouteTestFeedback(null);
    try {
      const res = await testPushNotification(`${search.origin} ➔ ${search.destination}`);
      const activeChannelsList = [
        search.pushEnabled !== false ? 'Push' : null,
        search.whatsappEnabled ? 'WhatsApp' : null,
        search.emailEnabled !== false ? 'E-mail' : null
      ].filter(Boolean);

      const channelStr = activeChannelsList.length > 0 ? activeChannelsList.join(' + ') : 'Nenhum canal ativo';

      setRouteTestFeedback({
        id: search.id,
        msg: `Disparo simulado com sucesso nos canais [${channelStr}] para a rota ${search.origin} ➔ ${search.destination}.`,
        type: 'success'
      });
    } catch {
      setRouteTestFeedback({
        id: search.id,
        msg: 'Falha no teste de envio.',
        type: 'error'
      });
    } finally {
      setTestingRouteId(null);
      setTimeout(() => setRouteTestFeedback(null), 6000);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-purple-900/50">
        <div>
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <Sliders className="w-4 h-4 text-[#22C55E]" />
            <span>Onde receber alertas</span>
          </h4>
          <p className="text-xs text-slate-300 mt-0.5">
            Defina canais individuais de recebimento (Push, WhatsApp e E-mail) para cada rota monitorada no Radar.
          </p>
        </div>

        <span className="text-xs text-slate-400 font-mono self-start sm:self-auto">
          {savedSearches.length} {savedSearches.length === 1 ? 'rota ativa' : 'rotas ativas'}
        </span>
      </div>

      {/* List of Routes with dedicated Channel Configuration Cards */}
      <div className="space-y-3">
        {savedSearches.map((search) => {
          const isExpanded = expandedId === search.id;
          const prog = programs.find(p => p.id === search.programId);

          const isPush = search.pushEnabled !== false;
          const isWhatsApp = search.whatsappEnabled === true;
          const isEmail = search.emailEnabled !== false;

          const activeCount = (isPush ? 1 : 0) + (isWhatsApp ? 1 : 0) + (isEmail ? 1 : 0);

          return (
            <div
              key={search.id}
              className={`rounded-2xl border transition-all overflow-hidden ${
                isExpanded
                  ? 'bg-[#150734] border-purple-600/90 shadow-xl shadow-purple-950/40 ring-1 ring-purple-500/20'
                  : 'bg-[#12052C] border-purple-900/70 hover:border-purple-700/80'
              }`}
            >
              {/* Accordion Route Header */}
              <div
                onClick={() => setExpandedId(isExpanded ? null : search.id)}
                className="p-3.5 sm:p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 cursor-pointer select-none"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-11 h-11 rounded-xl bg-[#220B4E] border border-purple-700/80 flex flex-col items-center justify-center font-mono font-black text-xs text-[#38BDF8] shrink-0 shadow-sm">
                    <span className="leading-tight">{search.origin}</span>
                    <span className="text-[10px] text-[#22C55E] leading-none">➔ {search.destination}</span>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h5 className="text-sm font-bold text-white truncate">{search.title}</h5>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-purple-950 border border-purple-800 text-purple-300 shrink-0">
                        {prog ? prog.name : 'Qualquer programa'}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-300 mt-1">
                      <span>Teto: <strong className="font-mono text-white">{search.maxMiles.toLocaleString('pt-BR')}</strong> {prog?.unitLabel || 'milhas'}</span>
                      <span className="text-slate-600">·</span>
                      <span className="capitalize">{search.cabinClass || 'Econômica'}</span>
                      <span className="text-slate-600">·</span>
                      <span className="text-slate-400">
                        Freq: <strong className="text-purple-300 font-semibold">{search.alertFrequency === 'daily' ? 'Diária' : search.alertFrequency === 'weekly' ? 'Semanal' : 'Imediata'}</strong>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 self-start md:self-center shrink-0">
                  {/* Channels Active Badges */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span
                      title="Push no Dispositivo"
                      className={`px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 border transition-all ${
                        isPush
                          ? 'bg-[#22C55E]/15 text-[#22C55E] border-[#22C55E]/40 shadow-xs'
                          : 'bg-slate-900/60 text-slate-500 border-slate-800 line-through'
                      }`}
                    >
                      <Bell className="w-3 h-3" />
                      <span>Push</span>
                    </span>

                    <span
                      title="Alertas via WhatsApp"
                      className={`px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 border transition-all ${
                        isWhatsApp
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-xs'
                          : 'bg-slate-900/60 text-slate-500 border-slate-800 line-through'
                      }`}
                    >
                      <MessageCircle className="w-3 h-3" />
                      <span>WhatsApp</span>
                    </span>

                    <span
                      title="Alertas via E-mail"
                      className={`px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 border transition-all ${
                        isEmail
                          ? 'bg-sky-500/20 text-sky-300 border-sky-500/50 shadow-xs'
                          : 'bg-slate-900/60 text-slate-500 border-slate-800 line-through'
                      }`}
                    >
                      <Mail className="w-3 h-3" />
                      <span>E-mail</span>
                    </span>
                  </div>

                  <div className="w-7 h-7 rounded-lg bg-purple-900/50 border border-purple-800/80 flex items-center justify-center text-slate-300">
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </div>
              </div>

              {/* Expanded Channel Settings Configuration Box */}
              {isExpanded && (
                <div className="p-4 sm:p-5 border-t border-purple-900/60 bg-[#120527]/90 space-y-4 animate-in fade-in">
                  {/* Channels Switch Cards */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-[#38BDF8]" />
                        Selecione os Canais Ativos para esta Rota
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {activeCount} de 3 canais habilitados
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {/* 1. Web Push Channel Card */}
                      <div
                        onClick={() => handleToggleChannel(search, 'push')}
                        className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                          isPush
                            ? 'bg-[#1C0A3E] border-[#22C55E]/60 shadow-[0_0_15px_rgba(34,197,94,0.12)]'
                            : 'bg-[#14062E]/70 border-purple-900/70 hover:border-purple-800 opacity-60'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                                isPush ? 'bg-[#22C55E] text-slate-950 font-bold' : 'bg-purple-950 text-slate-400'
                              }`}>
                                <BellRing className="w-4 h-4" />
                              </div>
                              <span className="text-xs font-bold text-white">Push Nativo</span>
                            </div>

                            <span className={`w-5 h-5 rounded-md flex items-center justify-center border text-[10px] font-bold ${
                              isPush
                                ? 'bg-[#22C55E] text-slate-950 border-[#22C55E]'
                                : 'bg-purple-950 text-transparent border-purple-800'
                            }`}>
                              {isPush && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                            </span>
                          </div>

                          <p className="text-[11px] text-slate-300 leading-tight">
                            Alertas instantâneos em tempo real no celular ou PC ao detectar baixa tarifária.
                          </p>
                        </div>

                        <div className="mt-3 pt-2 border-t border-purple-900/40 flex items-center justify-between text-[10px]">
                          <span className={isPush ? 'text-[#22C55E] font-semibold' : 'text-slate-500'}>
                            {isPush ? '● Ativo sem latência' : '○ Desativado'}
                          </span>
                          {pushPermission !== 'granted' && isPush && (
                            <span className="text-amber-300 font-bold flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" /> Requer Permissão
                            </span>
                          )}
                        </div>
                      </div>

                      {/* 2. WhatsApp Channel Card */}
                      <div
                        onClick={() => handleToggleChannel(search, 'whatsapp')}
                        className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                          isWhatsApp
                            ? 'bg-[#1C0A3E] border-emerald-500/70 shadow-[0_0_15px_rgba(16,185,129,0.12)]'
                            : 'bg-[#14062E]/70 border-purple-900/70 hover:border-purple-800 opacity-60'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                                isWhatsApp ? 'bg-emerald-500 text-slate-950 font-bold' : 'bg-purple-950 text-slate-400'
                              }`}>
                                <MessageCircle className="w-4 h-4" />
                              </div>
                              <span className="text-xs font-bold text-white">WhatsApp VIP</span>
                            </div>

                            <span className={`w-5 h-5 rounded-md flex items-center justify-center border text-[10px] font-bold ${
                              isWhatsApp
                                ? 'bg-emerald-500 text-slate-950 border-emerald-500'
                                : 'bg-purple-950 text-transparent border-purple-800'
                            }`}>
                              {isWhatsApp && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                            </span>
                          </div>

                          <p className="text-[11px] text-slate-300 leading-tight">
                            Mensagem instantânea com link direto de resgate (UTM) e detalhes da vaga encontrada.
                          </p>
                        </div>

                        <div className="mt-3 pt-2 border-t border-purple-900/40 flex items-center justify-between text-[10px]">
                          <span className={isWhatsApp ? 'text-emerald-400 font-semibold' : 'text-slate-500'}>
                            {isWhatsApp ? '● Ativo via Bot VIP' : '○ Desativado'}
                          </span>
                          <span className="text-slate-400 font-mono">
                            {user.email ? user.email.split('@')[0] : 'WhatsApp'}
                          </span>
                        </div>
                      </div>

                      {/* 3. E-mail Channel Card */}
                      <div
                        onClick={() => handleToggleChannel(search, 'email')}
                        className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                          isEmail
                            ? 'bg-[#1C0A3E] border-sky-500/70 shadow-[0_0_15px_rgba(56,189,248,0.12)]'
                            : 'bg-[#14062E]/70 border-purple-900/70 hover:border-purple-800 opacity-60'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                                isEmail ? 'bg-sky-400 text-slate-950 font-bold' : 'bg-purple-950 text-slate-400'
                              }`}>
                                <Mail className="w-4 h-4" />
                              </div>
                              <span className="text-xs font-bold text-white">E-mail Direto</span>
                            </div>

                            <span className={`w-5 h-5 rounded-md flex items-center justify-center border text-[10px] font-bold ${
                              isEmail
                                ? 'bg-sky-400 text-slate-950 border-sky-400'
                                : 'bg-purple-950 text-transparent border-purple-800'
                            }`}>
                              {isEmail && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                            </span>
                          </div>

                          <p className="text-[11px] text-slate-300 leading-tight">
                            Boletim com tabela de datas alternativas, taxas e link de emissão sem intermediários.
                          </p>
                        </div>

                        <div className="mt-3 pt-2 border-t border-purple-900/40 flex items-center justify-between text-[10px]">
                          <span className={isEmail ? 'text-sky-300 font-semibold' : 'text-slate-500'}>
                            {isEmail ? '● Ativo' : '○ Desativado'}
                          </span>
                          <span className="text-slate-400 truncate max-w-[120px]">
                            {user.email || 'Email cadastrado'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Channel Preset Buttons */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                    <span className="text-[11px] text-slate-400">Atalhos rápidos:</span>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleApplyPreset(search.id, 'all')}
                        className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-purple-900/50 hover:bg-purple-800 text-white border border-purple-700/60 transition-colors"
                      >
                        Todos os Canais (Push + WA + Email)
                      </button>
                      <button
                        type="button"
                        onClick={() => handleApplyPreset(search.id, 'push_only')}
                        className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-purple-900/50 hover:bg-purple-800 text-white border border-purple-700/60 transition-colors"
                      >
                        Apenas Push
                      </button>
                      <button
                        type="button"
                        onClick={() => handleApplyPreset(search.id, 'push_wa')}
                        className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-purple-900/50 hover:bg-purple-800 text-white border border-purple-700/60 transition-colors"
                      >
                        Push + WhatsApp
                      </button>
                      <button
                        type="button"
                        onClick={() => handleApplyPreset(search.id, 'mute')}
                        className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/60 transition-colors"
                      >
                        Silenciar Rota
                      </button>
                    </div>
                  </div>

                  {/* Route Trigger Criteria & Frequency */}
                  <div className="p-3.5 rounded-xl bg-[#17073B] border border-purple-800/60 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 mb-1 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-amber-400" />
                        Frequência de Notificação
                      </label>
                      <select
                        value={search.alertFrequency || 'immediate'}
                        onChange={(e) => updateRouteNotificationSettings(search.id, {
                          alertFrequency: e.target.value as any
                        })}
                        className="w-full text-xs bg-[#100427] text-white border border-purple-700/80 rounded-lg p-2 focus:ring-1 focus:ring-[#22C55E]"
                      >
                        <option value="immediate">Imediata (Tempo Real / Sem Latência)</option>
                        <option value="daily">Resumo Diário (Manhã)</option>
                        <option value="weekly">Resumo Semanal</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 mb-1 flex items-center gap-1">
                        <TrendingDown className="w-3 h-3 text-[#22C55E]" />
                        Gatilho de Queda Mínima
                      </label>
                      <select
                        value={search.targetPriceDropPercent || 0}
                        onChange={(e) => updateRouteNotificationSettings(search.id, {
                          targetPriceDropPercent: Number(e.target.value)
                        })}
                        className="w-full text-xs bg-[#100427] text-white border border-purple-700/80 rounded-lg p-2 focus:ring-1 focus:ring-[#22C55E]"
                      >
                        <option value={0}>Qualquer baixa abaixo do teto</option>
                        <option value={10}>Queda de pelo menos 10%</option>
                        <option value={20}>Queda de pelo menos 20%</option>
                        <option value={30}>Queda expressiva (30% ou mais)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 mb-1 flex items-center gap-1">
                        <Plane className="w-3 h-3 text-[#38BDF8]" />
                        Teto Máximo de Milhas
                      </label>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="number"
                          step={1000}
                          value={search.maxMiles}
                          onChange={(e) => updateRouteNotificationSettings(search.id, {
                            maxMiles: Math.max(1000, Number(e.target.value) || 10000)
                          })}
                          className="w-full text-xs font-mono bg-[#100427] text-white border border-purple-700/80 rounded-lg p-2 focus:ring-1 focus:ring-[#22C55E]"
                        />
                        <span className="text-[10px] text-slate-400 font-mono">pts</span>
                      </div>
                    </div>
                  </div>

                  {/* Test Feedback banner if active */}
                  {routeTestFeedback && routeTestFeedback.id === search.id && (
                    <div className={`p-3 rounded-xl border text-xs flex items-center gap-2 animate-in fade-in ${
                      routeTestFeedback.type === 'success'
                        ? 'bg-emerald-950/70 border-emerald-500/70 text-emerald-200'
                        : 'bg-rose-950/70 border-rose-500/70 text-rose-200'
                    }`}>
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span>{routeTestFeedback.msg}</span>
                    </div>
                  )}

                  {/* Actions Bar for this Route */}
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Shield className="w-3.5 h-3.5 text-[#22C55E]" />
                      Configurações gravadas automaticamente no seu perfil
                    </span>

                    <button
                      type="button"
                      disabled={testingRouteId === search.id}
                      onClick={() => handleTestRouteChannels(search)}
                      className="px-3 py-1.5 text-xs font-semibold text-slate-200 hover:text-white bg-[#200A45] hover:bg-purple-900 border border-purple-700/80 rounded-xl transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
                    >
                      {testingRouteId === search.id ? (
                        <Sparkles className="w-3.5 h-3.5 animate-spin text-[#38BDF8]" />
                      ) : (
                        <Send className="w-3.5 h-3.5 text-[#22C55E]" />
                      )}
                      <span>Testar Envio Multicanal</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { useFlySync } from '../../store/FlySyncContext';
import {
  Bell,
  BellRing,
  Zap,
  Sparkles,
  Sliders,
  CheckCircle,
  Volume2,
  RefreshCw,
  AlertCircle
} from 'lucide-react';

interface PushNotificationManagerCardProps {
  compact?: boolean;
}

export const PushNotificationManagerCard: React.FC<PushNotificationManagerCardProps> = ({ compact = false }) => {
  const {
    pushPermission,
    requestPushPermission,
    testPushNotification,
    setIsPushModalOpen,
    savedSearches,
    user
  } = useFlySync();

  const [testing, setTesting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const activePushRoutes = savedSearches.filter(s => s.isActive && s.pushEnabled !== false).length;

  const handleQuickPermission = async () => {
    const status = await requestPushPermission();
    if (status === 'granted') {
      setFeedback('Notificações Push ativadas com sucesso!');
    } else if (status === 'denied') {
      setFeedback('Permissão bloqueada no navegador. Abra as configurações para liberar.');
    }
    setTimeout(() => setFeedback(null), 5000);
  };

  const handleTest = async () => {
    setTesting(true);
    try {
      const res = await testPushNotification();
      setFeedback(res.message);
    } catch {
      setFeedback('Erro ao disparar teste.');
    } finally {
      setTesting(false);
      setTimeout(() => setFeedback(null), 6000);
    }
  };

  if (compact) {
    return (
      <div className="p-3.5 rounded-2xl bg-[#13062C]/90 border border-purple-900/60 shadow-lg flex items-center justify-between gap-3 text-white">
        <div className="flex items-center gap-2.5">
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
            pushPermission === 'granted'
              ? 'bg-[#22C55E]/20 text-[#22C55E] border border-emerald-500/40'
              : 'bg-purple-950 text-amber-300 border border-purple-800'
          }`}>
            {pushPermission === 'granted' ? (
              <BellRing className="w-4 h-4" />
            ) : (
              <Bell className="w-4 h-4" />
            )}
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-white">
                Alertas Push no Radar:
              </span>
              <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-sm ${
                pushPermission === 'granted'
                  ? 'bg-emerald-500/20 text-[#22C55E]'
                  : pushPermission === 'denied'
                  ? 'bg-rose-500/20 text-rose-300'
                  : 'bg-amber-500/20 text-amber-300'
              }`}>
                {pushPermission === 'granted' ? 'Ativo em Tempo Real' : pushPermission === 'denied' ? 'Bloqueado' : 'Pendente'}
              </span>
            </div>
            <span className="text-[11px] text-slate-400">
              {pushPermission === 'granted'
                ? `${activePushRoutes} ${activePushRoutes === 1 ? 'rota monitorada' : 'rotas monitoradas'} com alertas instantâneos`
                : 'Receba avisos imediatos de baixas de tarifas no seu celular'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {pushPermission !== 'granted' && (
            <button
              onClick={handleQuickPermission}
              className="px-3 py-1.5 text-xs font-bold text-slate-950 bg-[#22C55E] hover:bg-emerald-400 rounded-lg shadow-xs transition-colors flex items-center gap-1"
            >
              <Zap className="w-3.5 h-3.5 fill-slate-950" />
              <span>Ativar Push</span>
            </button>
          )}

          <button
            onClick={() => setIsPushModalOpen(true)}
            className="px-2.5 py-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-[#1A0B3B] hover:bg-purple-900/40 border border-purple-800/60 rounded-lg transition-colors flex items-center gap-1"
            title="Gerenciar rotas e permissões de push"
          >
            <Sliders className="w-3.5 h-3.5 text-[#38BDF8]" />
            <span className="hidden sm:inline">Gerenciar</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-5 rounded-2xl bg-gradient-to-br from-[#150734] to-[#0F0326] border border-purple-900/80 shadow-xl space-y-4 text-white">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
            pushPermission === 'granted'
              ? 'bg-gradient-to-tr from-[#22C55E] to-[#38BDF8] text-slate-950 shadow-[0_0_15px_rgba(34,197,94,0.3)]'
              : 'bg-purple-900/80 text-amber-300 border border-purple-700'
          }`}>
            {pushPermission === 'granted' ? (
              <BellRing className="w-5 h-5 fill-slate-950 stroke-[2.5]" />
            ) : (
              <Bell className="w-5 h-5" />
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white">
                Central de Permissões de Notificações Push
              </h3>
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                pushPermission === 'granted'
                  ? 'bg-emerald-500/20 text-[#22C55E] border border-emerald-500/40'
                  : pushPermission === 'denied'
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              }`}>
                {pushPermission === 'granted' ? 'Push Ativo' : pushPermission === 'denied' ? 'Bloqueado' : 'Aguardando Permissão'}
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Receba um aviso no celular assim que aparecer uma passagem boa.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
          {pushPermission !== 'granted' && (
            <button
              onClick={handleQuickPermission}
              className="px-3.5 py-2 text-xs font-bold text-slate-950 bg-[#22C55E] hover:bg-emerald-400 rounded-xl shadow-[0_0_12px_rgba(34,197,94,0.3)] transition-all flex items-center gap-1.5"
            >
              <Zap className="w-4 h-4 fill-slate-950" />
              <span>Conceder Permissão</span>
            </button>
          )}

          <button
            onClick={handleTest}
            disabled={testing}
            className="px-3 py-2 text-xs font-semibold text-slate-200 bg-[#1A0B3B] hover:bg-purple-900/60 border border-purple-800/70 rounded-xl transition-colors flex items-center gap-1.5"
            title="Dispara notificação de teste"
          >
            {testing ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#38BDF8]" />
            ) : (
              <Sparkles className="w-3.5 h-3.5 text-[#38BDF8]" />
            )}
            <span>Testar Envio</span>
          </button>

          <button
            onClick={() => setIsPushModalOpen(true)}
            className="px-3 py-2 text-xs font-bold text-slate-200 bg-[#1D0C42] hover:bg-purple-900/60 border border-purple-700/60 rounded-xl transition-colors flex items-center gap-1.5"
          >
            <Sliders className="w-3.5 h-3.5 text-[#22C55E]" />
            <span>Configurar por Rota</span>
          </button>
        </div>
      </div>

      {feedback && (
        <div className="p-3 rounded-xl bg-purple-950/80 border border-purple-700 text-xs text-purple-200 flex items-center gap-2 animate-in fade-in">
          <CheckCircle className="w-4 h-4 text-[#22C55E] shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Meta Bar */}
      <div className="pt-3 border-t border-purple-900/60 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="p-2.5 rounded-xl bg-[#1A0B3B]/60 border border-purple-900/40">
          <span className="text-[10px] text-slate-400 uppercase font-semibold block">Rotas Monitoradas</span>
          <span className="text-sm font-bold font-mono text-white">{savedSearches.length} rotas</span>
        </div>

        <div className="p-2.5 rounded-xl bg-[#1A0B3B]/60 border border-purple-900/40">
          <span className="text-[10px] text-slate-400 uppercase font-semibold block">Push Ativo</span>
          <span className="text-sm font-bold font-mono text-[#22C55E]">{activePushRoutes} com push</span>
        </div>

        <div className="p-2.5 rounded-xl bg-[#1A0B3B]/60 border border-purple-900/40">
          <span className="text-[10px] text-slate-400 uppercase font-semibold block">Alerta Sonoro</span>
          <span className="text-sm font-bold text-white flex items-center gap-1">
            <Volume2 className="w-3.5 h-3.5 text-cyan-300" />
            {user.preferences.soundEnabled ? 'Habilitado' : 'Mudo'}
          </span>
        </div>

        <div className="p-2.5 rounded-xl bg-[#1A0B3B]/60 border border-purple-900/40">
          <span className="text-[10px] text-slate-400 uppercase font-semibold block">Velocidade</span>
          <span className="text-sm font-bold text-[#38BDF8]">Tempo Real (Web Push)</span>
        </div>
      </div>
    </div>
  );
};

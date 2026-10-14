import React, { useEffect } from 'react';
import { useFlySync } from '../../store/FlySyncContext';
import { Bell, Sparkles, X, ChevronRight, Volume2 } from 'lucide-react';

interface PushNotificationToastProps {
  onOpenOffer?: (offerId: string) => void;
}

export const PushNotificationToast: React.FC<PushNotificationToastProps> = ({ onOpenOffer }) => {
  const { activeToastNotification, dismissToastNotification, user } = useFlySync();

  useEffect(() => {
    if (!activeToastNotification) return;

    const timer = setTimeout(() => {
      dismissToastNotification();
    }, 7000);

    return () => clearTimeout(timer);
  }, [activeToastNotification, dismissToastNotification]);

  if (!activeToastNotification) return null;

  return (
    <div className="fixed bottom-20 md:bottom-6 right-4 z-50 max-w-sm w-full animate-in slide-in-from-bottom-5 fade-in duration-200">
      <div className="bg-[#14062E]/95 backdrop-blur-xl border-2 border-[#22C55E]/80 shadow-[0_10px_35px_rgba(0,0,0,0.6),0_0_20px_rgba(34,197,94,0.3)] rounded-2xl p-4 text-white">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#22C55E] to-[#38BDF8] flex items-center justify-center text-slate-950 font-bold shadow-md shrink-0">
              <Bell className="w-4 h-4 fill-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] uppercase font-black tracking-wider px-1.5 py-0.5 rounded-sm bg-emerald-500/20 text-[#22C55E] border border-emerald-500/30">
                  Radar Push
                </span>
                {user.preferences.soundEnabled && (
                  <span className="text-[10px] text-cyan-300 flex items-center gap-0.5" title="Alerta sonoro ativo">
                    <Volume2 className="w-3 h-3" />
                  </span>
                )}
              </div>
              <h4 className="text-xs font-bold text-white mt-0.5 line-clamp-1">
                {activeToastNotification.title}
              </h4>
            </div>
          </div>

          <button
            onClick={dismissToastNotification}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
            aria-label="Fechar notificação"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-slate-300 mt-2 leading-relaxed">
          {activeToastNotification.message}
        </p>

        {activeToastNotification.offerDetails && (
          <div className="mt-3 pt-2.5 border-t border-purple-900/60 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5">
              <span className="font-mono font-bold text-[#38BDF8]">
                {activeToastNotification.offerDetails.route}
              </span>
              <span className="text-slate-400 text-[11px]">
                ({activeToastNotification.offerDetails.program})
              </span>
            </div>

            <button
              onClick={() => {
                if (activeToastNotification.offerId && onOpenOffer) {
                  onOpenOffer(activeToastNotification.offerId);
                }
                dismissToastNotification();
              }}
              className="px-2.5 py-1 text-[11px] font-bold text-slate-950 bg-[#22C55E] hover:bg-emerald-400 rounded-lg transition-colors flex items-center gap-1 shadow-xs"
            >
              <span>Ver no Radar</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

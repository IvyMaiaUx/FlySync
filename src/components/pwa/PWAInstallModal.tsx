import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { FlySyncLogo } from '../common/FlySyncLogo';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import {
  Download,
  Share2,
  PlusSquare,
  Smartphone,
  Laptop,
  CheckCircle2,
  Sparkles,
  Zap,
  WifiOff,
  BellRing
} from 'lucide-react';

interface PWAInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PWAInstallModal: React.FC<PWAInstallModalProps> = ({ isOpen, onClose }) => {
  const { isInstallable, isInstalled, defaultPlatform, install } = usePWAInstall();
  const [activeTab, setActiveTab] = useState<'android' | 'ios' | 'desktop'>(defaultPlatform);
  const [isInstalling, setIsInstalling] = useState(false);

  // Sync default platform when hook detects device
  useEffect(() => {
    setActiveTab(defaultPlatform);
  }, [defaultPlatform]);

  const handleTriggerInstall = async () => {
    setIsInstalling(true);
    try {
      const accepted = await install();
      if (accepted) {
        onClose();
      }
    } catch (err) {
      console.warn('Install error:', err);
    } finally {
      setIsInstalling(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Instalar FlySync no seu Dispositivo"
      subtitle="Aplicativo oficial leve com acesso rápido e notificações"
      size="lg"
    >
      <div className="text-white space-y-4">
        {/* Brand Banner */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#1F0A44] via-[#14062E] to-[#0A0218] p-4 sm:p-5 border border-purple-700/50 shadow-xl">
          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <FlySyncLogo size="md" isDarkTheme={true} />
            <div className="px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-[11px] font-bold text-emerald-400 flex items-center gap-1.5 shrink-0">
              <Sparkles className="w-3.5 h-3.5" />
              <span>PWA Leve & Seguro</span>
            </div>
          </div>
          <p className="mt-3 text-xs text-purple-200/90 leading-relaxed relative z-10">
            Tenha o <strong>FlySync</strong> na sua área de trabalho ou tela inicial sem precisar de lojas de aplicativos. Abra instantaneamente o radar de passagens e consulte seus saldos mesmo offline.
          </p>
        </div>

        {/* Benefits Micro-cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
          <div className="p-3 rounded-xl bg-purple-950/40 border border-purple-800/40 flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-[#22C55E] flex items-center justify-center shrink-0">
              <Zap className="w-3.5 h-3.5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-[11px]">Instantâneo</h4>
              <p className="text-[10px] text-slate-400">Abre sem telas de carregamento.</p>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-purple-950/40 border border-purple-800/40 flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-cyan-500/20 text-[#38BDF8] flex items-center justify-center shrink-0">
              <WifiOff className="w-3.5 h-3.5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-[11px]">Modo Offline</h4>
              <p className="text-[10px] text-slate-400">Consulte saldos e anotações.</p>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-purple-950/40 border border-purple-800/40 flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-purple-500/20 text-purple-300 flex items-center justify-center shrink-0">
              <BellRing className="w-3.5 h-3.5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-[11px]">Radar Direto</h4>
              <p className="text-[10px] text-slate-400">Alertas rápidos de milhas.</p>
            </div>
          </div>
        </div>

        {/* 1-Click Direct Install Card if browser supports it */}
        {isInstallable && !isInstalled && (
          <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950/60 via-purple-950/60 to-cyan-950/60 border border-emerald-500/50 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
            <div className="space-y-0.5 text-center sm:text-left">
              <div className="text-xs font-bold text-emerald-300 flex items-center justify-center sm:justify-start gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Instalação Direta Disponível!</span>
              </div>
              <p className="text-[11px] text-slate-300">
                Adicione o FlySync diretamente ao sistema com apenas 1 clique.
              </p>
            </div>

            <button
              onClick={handleTriggerInstall}
              disabled={isInstalling}
              className="w-full sm:w-auto px-5 py-2.5 text-xs font-black text-slate-950 bg-gradient-to-r from-[#4ADE80] to-[#22C55E] hover:from-[#22C55E] hover:to-[#16A34A] rounded-xl shadow-[0_0_20px_rgba(34,197,94,0.4)] transition-all flex items-center justify-center gap-2 shrink-0 active:scale-95 cursor-pointer"
            >
              <Download className="w-4 h-4 stroke-[2.5]" />
              <span>{isInstalling ? 'Instalando...' : 'Instalar Agora (1 Clique)'}</span>
            </button>
          </div>
        )}

        {/* Step-by-Step Device Guides */}
        <div className="pt-1">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 border-b border-purple-900/60 pb-2.5">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-300">
              Instruções por dispositivo:
            </span>
            <div className="flex flex-wrap gap-1">
              <button
                type="button"
                onClick={() => setActiveTab('desktop')}
                className={`px-3 py-1 text-xs rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'desktop'
                    ? 'bg-purple-700 text-white shadow-sm ring-1 ring-purple-400/50'
                    : 'bg-purple-950/50 text-slate-400 hover:text-white hover:bg-purple-900/40'
                }`}
              >
                <Laptop className="w-3.5 h-3.5" />
                <span>PC / Mac</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('ios')}
                className={`px-3 py-1 text-xs rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'ios'
                    ? 'bg-purple-700 text-white shadow-sm ring-1 ring-purple-400/50'
                    : 'bg-purple-950/50 text-slate-400 hover:text-white hover:bg-purple-900/40'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>iPhone / iPad</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('android')}
                className={`px-3 py-1 text-xs rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'android'
                    ? 'bg-purple-700 text-white shadow-sm ring-1 ring-purple-400/50'
                    : 'bg-purple-950/50 text-slate-400 hover:text-white hover:bg-purple-900/40'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Android</span>
              </button>
            </div>
          </div>

          {/* Desktop Guide */}
          {activeTab === 'desktop' && (
            <div className="space-y-2.5 bg-[#13062C]/70 p-4 rounded-xl border border-purple-800/40 text-xs">
              <div className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 font-bold flex items-center justify-center shrink-0 text-[11px]">1</span>
                <p className="text-slate-300">
                  No <strong>Google Chrome</strong> ou <strong>Microsoft Edge</strong>, localize o ícone de <Download className="w-3.5 h-3.5 inline text-cyan-400 mx-0.5" /> <strong>Instalar FlySync</strong> no canto direito da barra de endereços (URL).
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 font-bold flex items-center justify-center shrink-0 text-[11px]">2</span>
                <p className="text-slate-300">
                  Clique no ícone e confirme <strong className="text-cyan-400">"Instalar"</strong>.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 font-bold flex items-center justify-center shrink-0 text-[11px]">3</span>
                <p className="text-slate-300">
                  O FlySync abrirá em uma janela nativa com suporte à barra de tarefas e inicialização rápida do Windows/Mac.
                </p>
              </div>
            </div>
          )}

          {/* iOS Guide */}
          {activeTab === 'ios' && (
            <div className="space-y-2.5 bg-[#13062C]/70 p-4 rounded-xl border border-purple-800/40 text-xs">
              <div className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center shrink-0 text-[11px]">1</span>
                <p className="text-slate-300">
                  Abra esta página no <strong>Safari</strong> e toque no botão de <Share2 className="w-3.5 h-3.5 inline text-emerald-400 mx-0.5" /> <strong>Compartilhar</strong> (barra inferior).
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center shrink-0 text-[11px]">2</span>
                <p className="text-slate-300">
                  Role a lista para baixo e selecione <PlusSquare className="w-3.5 h-3.5 inline text-emerald-400 mx-0.5" /> <strong className="text-emerald-400">"Adicionar à Tela de Início"</strong>.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center shrink-0 text-[11px]">3</span>
                <p className="text-slate-300">
                  Toque em <strong>"Adicionar"</strong> no canto superior direito para fixar o FlySync no seu iPhone/iPad.
                </p>
              </div>
            </div>
          )}

          {/* Android Guide */}
          {activeTab === 'android' && (
            <div className="space-y-2.5 bg-[#13062C]/70 p-4 rounded-xl border border-purple-800/40 text-xs">
              <div className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center shrink-0 text-[11px]">1</span>
                <p className="text-slate-300">
                  No <strong>Google Chrome</strong> ou <strong>Samsung Internet</strong>, toque no menu de <strong>três pontinhos (⋮)</strong> no canto superior direito.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center shrink-0 text-[11px]">2</span>
                <p className="text-slate-300">
                  Selecione <strong className="text-emerald-400">"Instalar aplicativo"</strong> ou <strong className="text-emerald-400">"Adicionar à tela inicial"</strong>.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center shrink-0 text-[11px]">3</span>
                <p className="text-slate-300">
                  Confirme em <strong>"Instalar"</strong>. O ícone oficial aparecerá na tela do seu celular.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-purple-900/60">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-300 hover:text-white hover:bg-purple-900/40 rounded-xl transition-colors cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </Modal>
  );
};

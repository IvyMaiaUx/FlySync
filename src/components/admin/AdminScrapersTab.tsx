import React, { useState } from 'react';
import { useFlySync } from '../../store/FlySyncContext';
import {
  Database,
  Play,
  RotateCw,
  Terminal,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  Server,
  Pause,
  Power
} from 'lucide-react';

export const AdminScrapersTab: React.FC = () => {
  const {
    sources,
    toggleSourceStatus,
    collectionRuns,
    isScrapingActive,
    scraperLogs,
    adminTriggerScraper
  } = useFlySync();

  const [selectedSourceId, setSelectedSourceId] = useState<string>('all');
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  const handleRunCollector = async () => {
    setSuccessNotice(null);
    const res = await adminTriggerScraper(selectedSourceId === 'all' ? undefined : selectedSourceId);
    if (res.success) {
      setSuccessNotice(`${res.newOffersCount} tarifas mineradas e catalogadas com sucesso!`);
      setTimeout(() => setSuccessNotice(null), 4000);
    }
  };

  const activeSourcesCount = sources.filter(s => s.status === 'active').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Server className="w-4 h-4 text-emerald-400" />
            <span>Controle Operacional dos Scrapers & Coleta ao Vivo</span>
          </h3>
          <p className="text-xs text-purple-300">
            Monitore o robô Python em background, teste endpoints e acione varreduras manuais sob demanda.
          </p>
        </div>

        {/* Global trigger button */}
        <div className="flex items-center gap-2">
          <select
            value={selectedSourceId}
            onChange={(e) => setSelectedSourceId(e.target.value)}
            disabled={isScrapingActive}
            className="px-3 py-2 bg-[#180a33] border border-purple-800 rounded-xl text-xs text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-400 font-semibold"
          >
            <option value="all">Todas as Fontes (Geral)</option>
            {sources.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>

          <button
            onClick={handleRunCollector}
            disabled={isScrapingActive}
            className="px-4 py-2 bg-gradient-to-r from-[#22C55E] to-emerald-400 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-black rounded-xl text-xs flex items-center gap-2 shadow-[0_0_15px_rgba(34,197,94,0.3)] transition-all disabled:opacity-50 cursor-pointer"
          >
            <Play className={`w-3.5 h-3.5 fill-slate-950 ${isScrapingActive ? 'animate-spin' : ''}`} />
            <span>{isScrapingActive ? 'Minerando Tarifas...' : 'Executar Coleta Agora'}</span>
          </button>
        </div>
      </div>

      {successNotice && (
        <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successNotice}</span>
        </div>
      )}

      {/* Daemon Status Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-[#12052C] border border-purple-900/70 shadow-md">
          <span className="text-xs text-purple-300 block font-medium">Status do Daemon</span>
          <div className="mt-1 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#22C55E]" />
            <strong className="text-white text-base font-bold">Ativo & Operacional</strong>
          </div>
          <p className="text-[10px] text-purple-400 font-mono mt-1">PID 2805 · loop 20 min</p>
        </div>

        <div className="p-4 rounded-2xl bg-[#12052C] border border-purple-900/70 shadow-md">
          <span className="text-xs text-purple-300 block font-medium">Fontes em Monitoramento</span>
          <div className="mt-1 flex items-center gap-2">
            <strong className="text-white text-2xl font-black font-mono">
              {activeSourcesCount} <span className="text-xs text-slate-400 font-normal">/ {sources.length}</span>
            </strong>
          </div>
          <p className="text-[10px] text-purple-400 mt-1">Smiles, Latam, Azul, Livelo, TAP</p>
        </div>

        <div className="p-4 rounded-2xl bg-[#12052C] border border-purple-900/70 shadow-md">
          <span className="text-xs text-purple-300 block font-medium">Última Execução</span>
          <div className="mt-1 flex items-center gap-2">
            <strong className="text-white text-base font-bold font-mono">
              {collectionRuns[0] ? new Date(collectionRuns[0].finishedAt).toLocaleTimeString('pt-BR') : '14:30:00'}
            </strong>
          </div>
          <p className="text-[10px] text-emerald-400 font-semibold mt-1">100% de sucesso</p>
        </div>

        <div className="p-4 rounded-2xl bg-[#12052C] border border-purple-900/70 shadow-md">
          <span className="text-xs text-purple-300 block font-medium">Latência Média</span>
          <div className="mt-1 flex items-center gap-2">
            <strong className="text-white text-2xl font-black font-mono">415 ms</strong>
          </div>
          <p className="text-[10px] text-purple-400 mt-1">Proxies residenciais ativos</p>
        </div>
      </div>

      {/* Interactive Terminal / Real-time Logs */}
      <div className="p-5 rounded-2xl bg-[#090314] border border-purple-900/80 shadow-2xl space-y-3 font-mono">
        <div className="flex items-center justify-between pb-2 border-b border-purple-900/60">
          <div className="flex items-center gap-2 text-xs text-purple-300">
            <Terminal className="w-4 h-4 text-emerald-400" />
            <strong className="text-white">Console de Logs em Tempo Real (auto_radar_collector.py)</strong>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
            STREAMING ATIVO
          </span>
        </div>

        <div className="h-44 overflow-y-auto space-y-1 text-[11px] pr-2 text-slate-300 leading-relaxed scrollbar-thin scrollbar-thumb-purple-800">
          {scraperLogs.map((log, index) => (
            <div
              key={index}
              className={`p-1 rounded ${
                log.includes('🚀')
                  ? 'text-amber-300 font-bold bg-amber-500/10'
                  : log.includes('✅')
                  ? 'text-emerald-300 font-bold bg-emerald-500/10'
                  : 'text-purple-200'
              }`}
            >
              {log}
            </div>
          ))}
        </div>
      </div>

      {/* Sources Health & Toggle Table */}
      <div className="p-5 rounded-2xl bg-[#12052C] border border-purple-900/70 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Conectores e Status de Coleta por Programa
            </h4>
            <p className="text-xs text-purple-300">Ligue ou pause a varredura automática individualmente.</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-purple-900/60 text-purple-300 font-semibold uppercase text-[10px]">
                <th className="py-2.5 px-3">Fonte / Programa</th>
                <th className="py-2.5 px-3">Tipo</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Confiabilidade</th>
                <th className="py-2.5 px-3">Ofertas Catalogadas</th>
                <th className="py-2.5 px-3 text-right">Controle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-purple-900/40">
              {sources.map((src) => {
                const isActive = src.status === 'active';
                return (
                  <tr key={src.id} className="hover:bg-purple-900/20 transition-colors">
                    <td className="py-3 px-3">
                      <strong className="text-white block font-bold">{src.name}</strong>
                      <span className="text-[10px] text-purple-400 font-mono">
                        Intervalo: {src.frequencyMinutes} min
                      </span>
                    </td>

                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded bg-purple-950 border border-purple-800 text-[10px] font-mono font-bold uppercase text-purple-300">
                        {src.sourceType}
                      </span>
                    </td>

                    <td className="py-3 px-3">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          isActive
                            ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                            : 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                        <span>{isActive ? 'Ativo' : 'Pausado'}</span>
                      </span>
                    </td>

                    <td className="py-3 px-3 font-mono font-bold text-white">
                      {src.reliabilityScore}%
                    </td>

                    <td className="py-3 px-3 font-mono text-purple-200">
                      {src.totalOffersCollected.toLocaleString()}
                    </td>

                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => toggleSourceStatus(src.id)}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                          isActive
                            ? 'bg-rose-500/15 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40'
                            : 'bg-emerald-500/15 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40'
                        }`}
                      >
                        {isActive ? 'Pausar' : 'Ativar'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

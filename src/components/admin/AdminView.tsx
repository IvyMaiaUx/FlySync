import React, { useState } from 'react';
import { useFlySync } from '../../store/FlySyncContext';
import { FlightOffer, OfferSource, CollectionRun, CabinClass, OfferAvailabilityStatus } from '../../types';
import {
  ShieldAlert,
  Database,
  Play,
  Pause,
  Plus,
  RefreshCw,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  Layers,
  Activity,
  FileText,
  BarChart3,
  Plane
} from 'lucide-react';

export const AdminView: React.FC = () => {
  const {
    sources,
    collectionRuns,
    offers,
    programs,
    auditLogs,
    toggleSourceStatus,
    adminCreateOffer,
    adminUpdateOfferStatus
  } = useFlySync();

  const [activeTab, setActiveTab] = useState<'sources' | 'runs' | 'offers' | 'logs'>('sources');

  // New Manual Offer Form State
  const [showNewOfferModal, setShowNewOfferModal] = useState(false);
  const [newOrigin, setNewOrigin] = useState('GRU');
  const [newDest, setNewDest] = useState('LIS');
  const [newOriginCity, setNewOriginCity] = useState('São Paulo');
  const [newDestCity, setNewDestCity] = useState('Lisboa');
  const [newMiles, setNewMiles] = useState(72000);
  const [newCash, setNewCash] = useState(480.00);
  const [newProgramId, setNewProgramId] = useState(programs[0]?.id || '');
  const [newSourceId, setNewSourceId] = useState(sources[0]?.id || '');
  const [newAirline, setNewAirline] = useState('TAP Air Portugal');
  const [newCabin, setNewCabin] = useState<CabinClass>('economy');
  const [newAvailability, setNewAvailability] = useState<OfferAvailabilityStatus>('Verificada');
  const [newDeptDate, setNewDeptDate] = useState('2026-12-15');

  const handleCreateOfferSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const source = sources.find(s => s.id === newSourceId);
    adminCreateOffer({
      sourceId: newSourceId,
      sourceName: source?.name || 'Curadoria Manual FlySync',
      programId: newProgramId,
      origin: newOrigin.toUpperCase(),
      originCity: newOriginCity,
      destination: newDest.toUpperCase(),
      destCity: newDestCity,
      departureDate: newDeptDate,
      tripType: 'one_way',
      cabinClass: newCabin,
      miles: Number(newMiles),
      cashAmount: Number(newCash),
      currency: 'BRL',
      airline: newAirline,
      stops: 0,
      status: 'ativa',
      availabilityStatus: newAvailability,
      bookingUrl: 'https://www.flysync.app/emissao-oficial'
    });
    setShowNewOfferModal(false);
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
    <div className="space-y-6 animate-in fade-in duration-150 text-white">
      {/* Admin Header */}
      <div className="pb-4 border-b border-purple-900/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-amber-300 font-semibold mb-1">
            <ShieldAlert className="w-4 h-4 text-amber-400" />
            <span>Módulo Administrativo & Engenharia de Coleta</span>
            <span>·</span>
            <span>Coleta de ofertas</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Painel de Administração e Pipeline de Dados
          </h1>
          <p className="text-sm text-purple-200/80 mt-0.5">
            Gerencie fontes de coleta controladas, monitore integridade das execuções e administre o feed de ofertas.
          </p>
        </div>

        <button
          onClick={() => setShowNewOfferModal(true)}
          className="px-4 py-2 text-xs font-bold text-slate-950 bg-gradient-to-r from-[#4ADE80] to-[#22C55E] hover:from-[#22C55E] hover:to-[#16A34A] rounded-xl flex items-center gap-1.5 shadow-[0_0_15px_rgba(34,197,94,0.3)] transition-all"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          Cadastrar Oferta Manualmente
        </button>
      </div>

      {/* Admin Tabs */}
      <div className="flex items-center gap-1.5 p-1.5 bg-[#13062C] border border-purple-900/60 rounded-xl overflow-x-auto text-xs">
        <button
          onClick={() => setActiveTab('sources')}
          className={`px-4 py-2 text-xs font-bold rounded-lg whitespace-nowrap transition-all ${
            activeTab === 'sources'
              ? 'bg-[#22C55E] text-slate-950 shadow-md'
              : 'text-purple-300 hover:text-white hover:bg-purple-900/40'
          }`}
        >
          Fontes de Dados ({sources.length})
        </button>

        <button
          onClick={() => setActiveTab('runs')}
          className={`px-4 py-2 text-xs font-bold rounded-lg whitespace-nowrap transition-all ${
            activeTab === 'runs'
              ? 'bg-[#22C55E] text-slate-950 shadow-md'
              : 'text-purple-300 hover:text-white hover:bg-purple-900/40'
          }`}
        >
          Execuções de Coleta ({collectionRuns.length})
        </button>

        <button
          onClick={() => setActiveTab('offers')}
          className={`px-4 py-2 text-xs font-bold rounded-lg whitespace-nowrap transition-all ${
            activeTab === 'offers'
              ? 'bg-[#22C55E] text-slate-950 shadow-md'
              : 'text-purple-300 hover:text-white hover:bg-purple-900/40'
          }`}
        >
          Moderação de Ofertas ({offers.length})
        </button>

        <button
          onClick={() => setActiveTab('logs')}
          className={`px-4 py-2 text-xs font-bold rounded-lg whitespace-nowrap transition-all ${
            activeTab === 'logs'
              ? 'bg-[#22C55E] text-slate-950 shadow-md'
              : 'text-purple-300 hover:text-white hover:bg-purple-900/40'
          }`}
        >
          Auditoria & Logs ({auditLogs.length})
        </button>
      </div>

      {/* Tab Content 1: Sources */}
      {activeTab === 'sources' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-purple-300">
            <span>
              O cancelamento ou pausa de uma fonte não compromete o funcionamento das demais.
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sources.map((src) => {
              const isPaused = src.status === 'paused';

              return (
                <div
                  key={src.id}
                  className="p-5 rounded-2xl bg-[#13062C] border border-purple-900/70 flex flex-col justify-between shadow-lg"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-white">{src.name}</h3>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase ${
                            src.status === 'active'
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                              : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          }`}>
                            {src.status === 'active' ? 'Ativa' : 'Pausada'}
                          </span>
                        </div>
                        <p className="text-[11px] text-purple-300/80 mt-0.5">
                          Tipo: {src.sourceType.toUpperCase()} · Frequência: {src.frequencyMinutes} min
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-bold font-mono text-emerald-400 tabular-nums">
                          {src.reliabilityScore}%
                        </span>
                        <span className="text-[10px] text-slate-400 block">Confiabilidade</span>
                      </div>
                    </div>

                    <p className="text-xs text-purple-200/80 my-2 leading-relaxed">
                      {src.notes}
                    </p>

                    <div className="pt-3 border-t border-purple-900/60 grid grid-cols-2 gap-2 text-xs text-purple-300">
                      <div>
                        <span>Ofertas ativas: </span>
                        <strong className="text-white font-mono tabular-nums">{src.activeOffersCount}</strong>
                      </div>
                      <div>
                        <span>Total coletadas: </span>
                        <strong className="text-white font-mono tabular-nums">{src.totalOffersCollected}</strong>
                      </div>
                      <div className="col-span-2 text-[11px] text-slate-400">
                        Termos avaliados em: {formatDate(src.termsReviewedAt)}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-purple-900/60 flex items-center justify-between">
                    <button
                      onClick={() => toggleSourceStatus(src.id)}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
                        isPaused
                          ? 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30'
                          : 'bg-purple-950 text-purple-200 hover:bg-purple-900 border border-purple-800'
                      }`}
                    >
                      {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
                      <span>{isPaused ? 'Ativar Fonte' : 'Pausar Fonte'}</span>
                    </button>

                    <div className="text-[11px] text-purple-300/70 italic flex items-center gap-1">
                      <Clock className="w-3 h-3 text-purple-400" />
                      <span>{src.sourceType === 'curadoria' ? 'Modo Manual Ativo' : 'Aguardando Scraper'}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab Content 2: Runs */}
      {activeTab === 'runs' && (
        <div className="p-5 rounded-2xl bg-[#13062C] border border-purple-900/70 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-white">
              Histórico de Execuções dos Workers de Coleta
            </h3>
            <span className="text-xs text-purple-300">
              Deduplicação e validação em tempo real
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-purple-900/60 text-purple-300 font-semibold uppercase text-[10px]">
                  <th className="py-2.5">Início / Término</th>
                  <th className="py-2.5">Fonte</th>
                  <th className="py-2.5">Status</th>
                  <th className="py-2.5">Registros</th>
                  <th className="py-2.5">Válidas</th>
                  <th className="py-2.5">Duplicadas</th>
                  <th className="py-2.5">Latência</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-purple-900/40 font-mono text-purple-200">
                {collectionRuns.map((run) => (
                  <tr key={run.id} className="hover:bg-purple-900/20 transition-colors">
                    <td className="py-2.5 font-sans text-[11px] text-slate-400">
                      {formatDate(run.startedAt)}
                    </td>
                    <td className="py-2.5 font-sans font-semibold text-white">
                      {run.sourceName}
                    </td>
                    <td className="py-2.5">
                      <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-sm ${
                        run.status === 'success'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                          : run.status === 'partial'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                      }`}>
                        {run.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-2.5 tabular-nums">{run.recordsCount}</td>
                    <td className="py-2.5 tabular-nums text-emerald-400 font-bold">{run.validCount}</td>
                    <td className="py-2.5 tabular-nums text-purple-300">{run.duplicateCount}</td>
                    <td className="py-2.5 tabular-nums text-slate-400">{run.latencyMs}ms</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab Content 3: Moderation of Offers */}
      {activeTab === 'offers' && (
        <div className="p-5 rounded-2xl bg-[#13062C] border border-purple-900/70 space-y-4 shadow-lg">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">
              Controle e Invalidação de Ofertas no Feed
            </h3>
            <span className="text-xs text-purple-300">
              Administradores podem desativar ofertas desatualizadas
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-purple-900/60 text-purple-300 font-semibold uppercase text-[10px]">
                  <th className="py-2.5">Rota</th>
                  <th className="py-2.5">Programa</th>
                  <th className="py-2.5">Milhas & Taxas</th>
                  <th className="py-2.5">Fonte</th>
                  <th className="py-2.5">Status Atual</th>
                  <th className="py-2.5 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-purple-900/40">
                {offers.map((off) => {
                  const prog = programs.find(p => p.id === off.programId);

                  return (
                    <tr key={off.id} className="hover:bg-purple-900/20 transition-colors">
                      <td className="py-2.5">
                        <strong className="font-mono text-white">{off.origin} ➔ {off.destination}</strong>
                        <div className="text-[10px] text-slate-400">{off.airline} · {off.departureDate}</div>
                      </td>
                      <td className="py-2.5 font-medium text-purple-200">{prog?.name}</td>
                      <td className="py-2.5 font-mono">
                        <span className="font-bold text-emerald-400 tabular-nums">{off.miles.toLocaleString('pt-BR')}</span> {prog?.unitLabel}
                        <div className="text-[10px] text-slate-400">R$ {off.cashAmount.toFixed(2)}</div>
                      </td>
                      <td className="py-2.5 text-[11px] text-purple-300">{off.sourceName}</td>
                      <td className="py-2.5">
                        <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-sm uppercase ${
                          off.status === 'ativa'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                            : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                        }`}>
                          {off.status}
                        </span>
                      </td>
                      <td className="py-2.5 text-right">
                        {off.status === 'ativa' ? (
                          <button
                            onClick={() => adminUpdateOfferStatus(off.id, 'desatualizada')}
                            className="px-2 py-1 text-[11px] font-semibold text-rose-400 hover:bg-rose-500/20 rounded-md transition-colors"
                          >
                            Invalidar
                          </button>
                        ) : (
                          <button
                            onClick={() => adminUpdateOfferStatus(off.id, 'ativa')}
                            className="px-2 py-1 text-[11px] font-semibold text-emerald-400 hover:bg-emerald-500/20 rounded-md transition-colors"
                          >
                            Reativar
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab Content 5: Audit Logs */}
      {activeTab === 'logs' && (
        <div className="p-5 rounded-2xl bg-[#13062C] border border-purple-900/70 space-y-4 shadow-lg">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">
              Trilha de Auditoria do Sistema (`audit_logs`)
            </h3>
            <span className="text-xs text-purple-300">
              Registros imutáveis de ações de usuários e administradores
            </span>
          </div>

          <div className="space-y-2">
            {auditLogs.map((log) => (
              <div
                key={log.id}
                className="p-3 rounded-xl border border-purple-900/60 bg-purple-950/40 flex items-start justify-between gap-3 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <strong className="text-white">{log.action}</strong>
                    <span className="text-purple-300">por {log.actorName}</span>
                    <span className="text-[10px] uppercase font-bold text-cyan-300 bg-cyan-950 px-1.5 py-0.2 rounded-xs border border-cyan-800">
                      {log.entityType}
                    </span>
                  </div>
                  <p className="text-purple-200/80 mt-0.5">{log.details}</p>
                </div>
                <span className="text-[11px] font-mono text-slate-400 whitespace-nowrap">
                  {formatDate(log.createdAt)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Manual Offer Creation Modal */}
      {showNewOfferModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="bg-[#13062C] rounded-2xl p-6 max-w-lg w-full border border-purple-800/80 shadow-2xl space-y-4 text-white">
            <h3 className="text-base font-bold text-white">
              Cadastrar Oferta Manualmente (Curadoria)
            </h3>
            <form onSubmit={handleCreateOfferSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-purple-200 mb-1">Origem (IATA)</label>
                  <input
                    type="text"
                    value={newOrigin}
                    onChange={(e) => setNewOrigin(e.target.value.toUpperCase())}
                    className="w-full px-3 py-1.5 border border-purple-800 rounded-lg uppercase font-mono font-bold bg-[#180A38] text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-purple-200 mb-1">Destino (IATA)</label>
                  <input
                    type="text"
                    value={newDest}
                    onChange={(e) => setNewDest(e.target.value.toUpperCase())}
                    className="w-full px-3 py-1.5 border border-purple-800 rounded-lg uppercase font-mono font-bold bg-[#180A38] text-white"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-purple-200 mb-1">Milhas Necessárias</label>
                  <input
                    type="number"
                    value={newMiles}
                    onChange={(e) => setNewMiles(Number(e.target.value))}
                    className="w-full px-3 py-1.5 border border-purple-800 rounded-lg font-mono bg-[#180A38] text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-purple-200 mb-1">Taxas de Embarque (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newCash}
                    onChange={(e) => setNewCash(Number(e.target.value))}
                    className="w-full px-3 py-1.5 border border-purple-800 rounded-lg font-mono bg-[#180A38] text-white"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-purple-200 mb-1">Programa</label>
                  <select
                    value={newProgramId}
                    onChange={(e) => setNewProgramId(e.target.value)}
                    className="w-full px-3 py-1.5 border border-purple-800 rounded-lg bg-[#180A38] text-white"
                  >
                    {programs.map(p => (
                      <option key={p.id} value={p.id} className="bg-[#13062C]">{p.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-purple-200 mb-1">Cabine</label>
                  <select
                    value={newCabin}
                    onChange={(e) => setNewCabin(e.target.value as any)}
                    className="w-full px-3 py-1.5 border border-purple-800 rounded-lg bg-[#180A38] text-white"
                  >
                    <option value="economy" className="bg-[#13062C]">Classe Econômica</option>
                    <option value="business" className="bg-[#13062C]">Classe Executiva</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-purple-200 mb-1">Companhia Aérea</label>
                  <input
                    type="text"
                    value={newAirline}
                    onChange={(e) => setNewAirline(e.target.value)}
                    className="w-full px-3 py-1.5 border border-purple-800 rounded-lg bg-[#180A38] text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-purple-200 mb-1">Data da Viagem</label>
                  <input
                    type="date"
                    value={newDeptDate}
                    onChange={(e) => setNewDeptDate(e.target.value)}
                    className="w-full px-3 py-1.5 border border-purple-800 rounded-lg bg-[#180A38] text-white"
                    required
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-purple-900/60 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewOfferModal(false)}
                  className="px-4 py-2 font-medium text-slate-400 hover:text-white rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-bold text-slate-950 bg-[#22C55E] hover:bg-emerald-400 rounded-lg transition-colors"
                >
                  Publicar Oferta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

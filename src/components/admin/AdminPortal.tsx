import React, { useState } from 'react';
import { useFlySync } from '../../store/FlySyncContext';
import { buildOfficialBookingUrl } from '../../utils/bookingUrls';
import {
  ShieldAlert,
  ShieldCheck,
  Database,
  ArrowLeft,
  Plus,
  Play,
  Pause,
  Clock,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  FileCode,
  Users,
  Activity,
  Layers,
  Lock,
  LogOut,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Plane,
  Radar
} from 'lucide-react';
import { CabinClass, OfferAvailabilityStatus, FlightOffer } from '../../types';
import { FlySyncLogo } from '../common/FlySyncLogo';

interface AdminPortalProps {
  onBackToApp: () => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({ onBackToApp }) => {
  const {
    user,
    isAuthenticated,
    signIn,
    signOut,
    sources,
    collectionRuns,
    offers,
    programs,
    auditLogs,
    toggleSourceStatus,
    adminCreateOffer,
    adminUpdateOfferStatus
  } = useFlySync();

  // Navigation tab
  const [activeTab, setActiveTab] = useState<'offers' | 'sources' | 'runs' | 'logs' | 'scraper_guide'>('offers');

  // Login form state for unauthenticated or non-admin users
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Modal to create offer manually
  const [showNewOfferModal, setShowNewOfferModal] = useState(false);
  const [newOrigin, setNewOrigin] = useState('GRU');
  const [newDest, setNewDest] = useState('LIS');
  const [newOriginCity, setNewOriginCity] = useState('São Paulo');
  const [newDestCity, setNewDestCity] = useState('Lisboa');
  const [newMiles, setNewMiles] = useState(72000);
  const [newCash, setNewCash] = useState(480.00);
  const [newProgramId, setNewProgramId] = useState(programs[0]?.id || 'prog-smiles');
  const [newSourceId, setNewSourceId] = useState(sources[0]?.id || 'src-manual');
  const [newAirline, setNewAirline] = useState('TAP Air Portugal');
  const [newCabin, setNewCabin] = useState<CabinClass>('economy');
  const [newAvailability, setNewAvailability] = useState<OfferAvailabilityStatus>('Verificada');
  const [newDeptDate, setNewDeptDate] = useState('2026-12-15');
  const [isSubmittingOffer, setIsSubmittingOffer] = useState(false);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError(null);
    const res = await signIn(adminEmail, adminPassword);
    setIsLoggingIn(false);
    if (!res.success) {
      setLoginError(res.error || 'Credenciais de administrador inválidas.');
    }
  };

  const handleCreateOfferSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingOffer(true);
    const source = sources.find(s => s.id === newSourceId);
    await adminCreateOffer({
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
      bookingUrl: buildOfficialBookingUrl({
        origin: newOrigin,
        destination: newDest,
        departureDate: newDepDate,
        programId: newProgram,
        airline: newAirline,
        cabinClass: newCabin
      })
    });
    setIsSubmittingOffer(false);
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

  // 1. Guard de Acesso: Se não estiver logado, exibe tela de login exclusivo do Admin
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#070114] text-white flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden font-sans">
        <div className="fixed top-1/4 left-1/3 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="fixed bottom-1/4 right-1/3 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-md w-full bg-[#110526] border border-purple-900/80 rounded-3xl p-8 shadow-2xl relative z-10 space-y-6">
          <div className="text-center space-y-2">
            <div className="flex justify-center mb-2">
              <div className="p-3 bg-amber-500/15 border border-amber-500/40 rounded-2xl text-amber-400">
                <ShieldCheck className="w-8 h-8" />
              </div>
            </div>
            <h1 className="text-xl font-black text-white tracking-tight">Portal do Administrador</h1>
            <p className="text-xs text-purple-300">
              Área de backoffice restrita para engenharia de coleta e curadoria do FlySync.
            </p>
          </div>

          {loginError && (
            <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-500/50 text-xs text-rose-300 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleAdminLogin} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-purple-200 mb-1">E-mail de Administrador</label>
              <input
                type="email"
                required
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                placeholder="admin@flysync.app"
                className="w-full px-3.5 py-2.5 bg-[#180838] border border-purple-800 rounded-xl text-white focus:ring-2 focus:ring-[#22C55E] focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block font-semibold text-purple-200 mb-1">Senha de Acesso</label>
              <input
                type="password"
                required
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 bg-[#180838] border border-purple-800 rounded-xl text-white focus:ring-2 focus:ring-[#22C55E] focus:outline-hidden"
              />
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Lock className="w-4 h-4" />
              <span>{isLoggingIn ? 'Verificando permissões...' : 'Entrar no Backoffice'}</span>
            </button>
          </form>

          <div className="pt-4 border-t border-purple-900/60 text-center">
            <button
              onClick={onBackToApp}
              className="text-xs text-purple-300 hover:text-white flex items-center justify-center gap-1.5 mx-auto transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Voltar ao aplicativo do passageiro</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 2. Guard de Permissão: Se está autenticado, mas NÃO tem papel 'admin' no banco
  if (user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-[#070114] text-white flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden font-sans">
        <div className="max-w-md w-full bg-[#110526] border border-rose-500/40 rounded-3xl p-8 shadow-2xl relative z-10 space-y-6 text-center">
          <div className="flex justify-center">
            <div className="p-3 bg-rose-500/15 border border-rose-500/40 rounded-2xl text-rose-400">
              <ShieldAlert className="w-8 h-8" />
            </div>
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Acesso Restrito</h1>
            <p className="text-xs text-purple-200 mt-1">
              A conta <strong className="text-white font-mono">{user.email}</strong> está conectada, mas não possui privilégios de administrador no banco de dados.
            </p>
          </div>

          <div className="p-3 bg-purple-950/60 rounded-xl border border-purple-800 text-[11px] text-purple-300 text-left space-y-1">
            <span className="font-bold text-amber-300 block">Dica para liberar seu acesso:</span>
            <span>Rode no SQL Editor do Supabase para promover este e-mail:</span>
            <code className="block p-2 bg-black/40 rounded border border-purple-900 text-emerald-400 font-mono text-[10px] break-all select-all">
              update public.profiles set role = 'admin' where id = '{user.id}';
            </code>
          </div>

          <div className="flex flex-col gap-2 pt-2">
            <button
              onClick={onBackToApp}
              className="w-full py-2.5 bg-[#22C55E] hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs transition-colors"
            >
              Voltar ao Aplicativo
            </button>
            <button
              onClick={signOut}
              className="w-full py-2 bg-purple-900/40 hover:bg-purple-900/80 text-purple-200 rounded-xl text-xs transition-colors"
            >
              Sair desta conta
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 3. Usuário Autenticado como Admin: Painel Administrativo Completo e Dedicado
  const activeOffersCount = offers.filter(o => o.status === 'ativa').length;

  return (
    <div className="min-h-screen bg-[#090218] text-slate-100 flex flex-col font-sans selection:bg-amber-400 selection:text-slate-950">
      {/* Top Admin Header Bar */}
      <header className="sticky top-0 z-40 bg-[#0E0326]/95 backdrop-blur-md border-b border-amber-500/30 text-white shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            {/* Left: Brand + Admin Badge */}
            <div className="flex items-center gap-3 shrink-0">
              <FlySyncLogo size="sm" isDarkTheme={true} />
              <div className="h-5 w-px bg-purple-800" />
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/15 border border-amber-500/40 text-amber-300 text-xs font-bold uppercase tracking-wider">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                <span>Backoffice</span>
              </div>
            </div>

            {/* Center: Database status indicator */}
            <div className="hidden lg:flex items-center gap-2 px-3 py-1 bg-purple-950/60 rounded-full border border-purple-800/80 text-xs">
              <span className="w-2 h-2 rounded-full bg-[#22C55E] shadow-[0_0_8px_#22C55E] animate-pulse" />
              <span className="text-slate-300">Supabase Postgres:</span>
              <strong className="text-white font-mono text-[11px]">kcbuuwftyoyqisltqcuh</strong>
            </div>

            {/* Right: Actions (Back to app, user badge, logout) */}
            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={onBackToApp}
                className="px-3 py-1.5 bg-purple-900/50 hover:bg-purple-800 border border-purple-700/60 text-white text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5"
                title="Retornar para a visualização do passageiro"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-[#22C55E]" />
                <span className="hidden sm:inline">Ver App do Usuário</span>
              </button>

              <div className="flex items-center gap-2 pl-2 border-l border-purple-800/80">
                <div className="text-right hidden sm:block text-xs">
                  <span className="font-bold text-white block leading-tight">{user.displayName}</span>
                  <span className="text-[10px] text-amber-300 font-mono">ADMIN</span>
                </div>
                <button
                  onClick={signOut}
                  className="p-2 text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                  title="Encerrar sessão de administrador"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Admin Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Quick KPI Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-[#12052C] border border-purple-900/70 shadow-lg flex items-center justify-between">
            <div>
              <span className="text-xs text-purple-300 font-medium block">Ofertas Ativas no Radar</span>
              <div className="text-2xl font-black text-white font-mono tabular-nums mt-0.5">
                {activeOffersCount} <span className="text-xs font-normal text-slate-400">/ {offers.length}</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 flex items-center justify-center">
              <Plane className="w-5 h-5" />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#12052C] border border-purple-900/70 shadow-lg flex items-center justify-between">
            <div>
              <span className="text-xs text-purple-300 font-medium block">Fontes de Coleta</span>
              <div className="text-2xl font-black text-white font-mono tabular-nums mt-0.5">
                {sources.length} <span className="text-xs font-normal text-slate-400">fontes</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/40 text-purple-300 flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#12052C] border border-purple-900/70 shadow-lg flex items-center justify-between">
            <div>
              <span className="text-xs text-purple-300 font-medium block">Programas Ativos</span>
              <div className="text-2xl font-black text-white font-mono tabular-nums mt-0.5">
                {programs.length} <span className="text-xs font-normal text-slate-400">parceiros</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-sky-500/15 border border-sky-500/40 text-sky-400 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#12052C] border border-purple-900/70 shadow-lg flex items-center justify-between">
            <div>
              <span className="text-xs text-purple-300 font-medium block">Auditoria & Logs</span>
              <div className="text-2xl font-black text-white font-mono tabular-nums mt-0.5">
                {auditLogs.length} <span className="text-xs font-normal text-slate-400">eventos</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-400 flex items-center justify-center">
              <Activity className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Admin Navigation Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-purple-900/60">
          <div className="flex items-center gap-1.5 p-1 bg-[#12052C] border border-purple-900/80 rounded-xl overflow-x-auto text-xs">
            <button
              onClick={() => setActiveTab('offers')}
              className={`px-4 py-2 text-xs font-bold rounded-lg whitespace-nowrap transition-all ${
                activeTab === 'offers'
                  ? 'bg-amber-400 text-slate-950 shadow-md font-black'
                  : 'text-purple-300 hover:text-white hover:bg-purple-900/40'
              }`}
            >
              Ofertas & Curadoria ({offers.length})
            </button>

            <button
              onClick={() => setActiveTab('sources')}
              className={`px-4 py-2 text-xs font-bold rounded-lg whitespace-nowrap transition-all ${
                activeTab === 'sources'
                  ? 'bg-amber-400 text-slate-950 shadow-md font-black'
                  : 'text-purple-300 hover:text-white hover:bg-purple-900/40'
              }`}
            >
              Fontes de Dados ({sources.length})
            </button>

            <button
              onClick={() => setActiveTab('runs')}
              className={`px-4 py-2 text-xs font-bold rounded-lg whitespace-nowrap transition-all ${
                activeTab === 'runs'
                  ? 'bg-amber-400 text-slate-950 shadow-md font-black'
                  : 'text-purple-300 hover:text-white hover:bg-purple-900/40'
              }`}
            >
              Execuções de Coleta ({collectionRuns.length})
            </button>

            <button
              onClick={() => setActiveTab('logs')}
              className={`px-4 py-2 text-xs font-bold rounded-lg whitespace-nowrap transition-all ${
                activeTab === 'logs'
                  ? 'bg-amber-400 text-slate-950 shadow-md font-black'
                  : 'text-purple-300 hover:text-white hover:bg-purple-900/40'
              }`}
            >
              Auditoria ({auditLogs.length})
            </button>

            <button
              onClick={() => setActiveTab('scraper_guide')}
              className={`px-4 py-2 text-xs font-bold rounded-lg whitespace-nowrap transition-all flex items-center gap-1.5 ${
                activeTab === 'scraper_guide'
                  ? 'bg-emerald-500 text-slate-950 shadow-md font-black'
                  : 'text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10'
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>Integração do Scraper</span>
            </button>
          </div>

          <button
            onClick={() => setShowNewOfferModal(true)}
            className="px-4 py-2 text-xs font-bold text-slate-950 bg-[#22C55E] hover:bg-emerald-400 rounded-xl flex items-center gap-1.5 shadow-[0_0_15px_rgba(34,197,94,0.3)] transition-all shrink-0 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Cadastrar Oferta Manualmente</span>
          </button>
        </div>

        {/* Tab 1: Offers Moderation */}
        {activeTab === 'offers' && (
          <div className="p-5 rounded-2xl bg-[#12052C] border border-purple-900/70 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">Moderação e Feed Oficial de Ofertas</h3>
                <p className="text-xs text-purple-300">
                  Qualquer oferta inserida ou alterada aqui reflete imediatamente no Radar para todos os usuários em tempo real.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-purple-900/60 text-purple-300 font-semibold uppercase text-[10px]">
                    <th className="py-2.5">Rota</th>
                    <th className="py-2.5">Programa</th>
                    <th className="py-2.5">Milhas & Taxas</th>
                    <th className="py-2.5">Fonte</th>
                    <th className="py-2.5">Status</th>
                    <th className="py-2.5 text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-purple-900/40">
                  {offers.map((off) => {
                    const prog = programs.find(p => p.id === off.programId);
                    return (
                      <tr key={off.id} className="hover:bg-purple-900/20 transition-colors">
                        <td className="py-2.5">
                          <strong className="font-mono text-white text-xs">{off.origin} ➔ {off.destination}</strong>
                          <div className="text-[10px] text-slate-400">{off.airline} · {off.departureDate}</div>
                        </td>
                        <td className="py-2.5 font-medium text-purple-200">{prog?.name || off.programId}</td>
                        <td className="py-2.5 font-mono">
                          <span className="font-bold text-emerald-400 tabular-nums">{off.miles.toLocaleString('pt-BR')}</span> {prog?.unitLabel || 'milhas'}
                          <div className="text-[10px] text-slate-400">R$ {off.cashAmount.toFixed(2)}</div>
                        </td>
                        <td className="py-2.5 text-[11px] text-purple-300">{off.sourceName}</td>
                        <td className="py-2.5">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-sm uppercase ${
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
                              className="px-2.5 py-1 text-[11px] font-semibold text-rose-400 hover:bg-rose-500/20 rounded-md transition-colors"
                            >
                              Invalidar
                            </button>
                          ) : (
                            <button
                              onClick={() => adminUpdateOfferStatus(off.id, 'ativa')}
                              className="px-2.5 py-1 text-[11px] font-semibold text-emerald-400 hover:bg-emerald-500/20 rounded-md transition-colors"
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

        {/* Tab 2: Sources */}
        {activeTab === 'sources' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sources.map((src) => {
              const isPaused = src.status === 'paused';
              return (
                <div key={src.id} className="p-5 rounded-2xl bg-[#12052C] border border-purple-900/70 flex flex-col justify-between shadow-lg">
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
                        <span className="text-xs font-bold font-mono text-emerald-400 tabular-nums">{src.reliabilityScore}%</span>
                        <span className="text-[10px] text-slate-400 block">Confiabilidade</span>
                      </div>
                    </div>
                    <p className="text-xs text-purple-200/80 my-2 leading-relaxed">{src.notes}</p>
                    <div className="pt-3 border-t border-purple-900/60 grid grid-cols-2 gap-2 text-xs text-purple-300">
                      <div>
                        <span>Ofertas ativas: </span>
                        <strong className="text-white font-mono tabular-nums">{src.activeOffersCount}</strong>
                      </div>
                      <div>
                        <span>Total coletadas: </span>
                        <strong className="text-white font-mono tabular-nums">{src.totalOffersCollected}</strong>
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
        )}

        {/* Tab 3: Collection Runs */}
        {activeTab === 'runs' && (
          <div className="p-5 rounded-2xl bg-[#12052C] border border-purple-900/70 shadow-lg">
            <h3 className="text-sm font-bold text-white mb-4">Histórico de Execuções de Coleta</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-purple-900/60 text-purple-300 font-semibold uppercase text-[10px]">
                    <th className="py-2.5">Início</th>
                    <th className="py-2.5">Fonte</th>
                    <th className="py-2.5">Status</th>
                    <th className="py-2.5">Capturadas</th>
                    <th className="py-2.5">Válidas</th>
                    <th className="py-2.5">Duplicadas</th>
                    <th className="py-2.5">Latência</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-purple-900/40 font-mono text-purple-200">
                  {collectionRuns.map((run) => (
                    <tr key={run.id} className="hover:bg-purple-900/20 transition-colors">
                      <td className="py-2.5 font-sans text-[11px] text-slate-400">{formatDate(run.startedAt)}</td>
                      <td className="py-2.5 font-sans font-semibold text-white">{run.sourceName}</td>
                      <td className="py-2.5">
                        <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-sm ${
                          run.status === 'success'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                            : 'bg-amber-500/20 text-amber-300'
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

        {/* Tab 4: Audit Logs */}
        {activeTab === 'logs' && (
          <div className="p-5 rounded-2xl bg-[#12052C] border border-purple-900/70 space-y-3 shadow-lg">
            <h3 className="text-sm font-bold text-white mb-2">Trilha de Auditoria do Sistema (`audit_logs`)</h3>
            <div className="space-y-2">
              {auditLogs.map((log) => (
                <div key={log.id} className="p-3 rounded-xl border border-purple-900/60 bg-purple-950/40 flex items-start justify-between gap-3 text-xs">
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
                  <span className="text-[11px] font-mono text-slate-400 whitespace-nowrap">{formatDate(log.createdAt)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 5: Scraper Integration Guide */}
        {activeTab === 'scraper_guide' && (
          <div className="p-6 rounded-2xl bg-[#12052C] border border-emerald-500/40 space-y-6 shadow-xl text-xs">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-500/15 border border-emerald-500/40 rounded-xl text-emerald-400">
                <FileCode className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Como Conectar o seu Scraper ao FlySync</h3>
                <p className="text-purple-300">
                  O banco Supabase já está 100% preparado com triggers que disparam alertas automaticamente quando seu scraper inserir novas ofertas.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-purple-200">
              <div className="p-4 rounded-xl bg-purple-950/50 border border-purple-800/60 space-y-1">
                <strong className="text-white block font-semibold text-xs">1. Endpoint do Banco</strong>
                <p className="text-[11px]">PostgreSQL padrão acessível via porta 5432 ou pela API REST do Supabase.</p>
              </div>
              <div className="p-4 rounded-xl bg-purple-950/50 border border-purple-800/60 space-y-1">
                <strong className="text-white block font-semibold text-xs">2. Tabela Alvo</strong>
                <p className="text-[11px] font-mono text-emerald-400">public.offers</p>
                <p className="text-[11px]">Basta inserir rota, milhas, taxas e companhia.</p>
              </div>
              <div className="p-4 rounded-xl bg-purple-950/50 border border-purple-800/60 space-y-1">
                <strong className="text-white block font-semibold text-xs">3. Chave de Serviço</strong>
                <p className="text-[11px]">Use a <code className="text-amber-300">service_role</code> do Supabase no seu scraper para escrita direta.</p>
              </div>
            </div>

            <div className="space-y-2">
              <span className="font-bold text-white block">Exemplo em Python (se o seu scraper for em Python):</span>
              <pre className="p-4 rounded-xl bg-[#090218] border border-purple-900 text-purple-200 font-mono text-[11px] overflow-x-auto leading-relaxed">
{`from supabase import create_client

url = "https://kcbuuwftyoyqisltqcuh.supabase.co"
key = "SUA_SERVICE_ROLE_KEY" # pega em Settings -> API no Supabase
supabase = create_client(url, key)

# Inserção de uma passagem coletada pelo seu scraper:
supabase.table("offers").insert({
    "source_id": "src-scraper",
    "source_name": "Scraper FlySync",
    "program_id": "prog-smiles", # ou prog-latampass, prog-azul, prog-tap, prog-iberia
    "origin": "GRU",
    "destination": "MIA",
    "departure_date": "2026-11-20",
    "miles": 45000,
    "cash_amount": 380.50,
    "airline": "GOL Linhas Aéreas",
    "cabin_class": "economy",
    "status": "ativa",
    "booking_url": "https://www.smiles.com.br"
}).execute()`}
              </pre>
            </div>
          </div>
        )}
      </main>

      {/* Manual Offer Creation Modal */}
      {showNewOfferModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="bg-[#12052C] rounded-2xl p-6 max-w-lg w-full border border-purple-800/80 shadow-2xl space-y-4 text-white animate-in zoom-in-95">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Plus className="w-4 h-4 text-[#22C55E]" />
              <span>Cadastrar Oferta Manualmente no Supabase</span>
            </h3>
            <form onSubmit={handleCreateOfferSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-purple-200 mb-1">Origem (IATA)</label>
                  <input
                    type="text"
                    value={newOrigin}
                    onChange={(e) => setNewOrigin(e.target.value.toUpperCase())}
                    className="w-full px-3 py-2 border border-purple-800 rounded-lg uppercase font-mono font-bold bg-[#180A38] text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-purple-200 mb-1">Destino (IATA)</label>
                  <input
                    type="text"
                    value={newDest}
                    onChange={(e) => setNewDest(e.target.value.toUpperCase())}
                    className="w-full px-3 py-2 border border-purple-800 rounded-lg uppercase font-mono font-bold bg-[#180A38] text-white"
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
                    className="w-full px-3 py-2 border border-purple-800 rounded-lg font-mono bg-[#180A38] text-white"
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
                    className="w-full px-3 py-2 border border-purple-800 rounded-lg font-mono bg-[#180A38] text-white"
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
                    className="w-full px-3 py-2 border border-purple-800 rounded-lg bg-[#180A38] text-white"
                  >
                    {programs.map(p => (
                      <option key={p.id} value={p.id} className="bg-[#12052C]">{p.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-purple-200 mb-1">Cabine</label>
                  <select
                    value={newCabin}
                    onChange={(e) => setNewCabin(e.target.value as any)}
                    className="w-full px-3 py-2 border border-purple-800 rounded-lg bg-[#180A38] text-white"
                  >
                    <option value="economy" className="bg-[#12052C]">Classe Econômica</option>
                    <option value="business" className="bg-[#12052C]">Classe Executiva</option>
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
                    className="w-full px-3 py-2 border border-purple-800 rounded-lg bg-[#180A38] text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-purple-200 mb-1">Data da Viagem</label>
                  <input
                    type="date"
                    value={newDeptDate}
                    onChange={(e) => setNewDeptDate(e.target.value)}
                    className="w-full px-3 py-2 border border-purple-800 rounded-lg bg-[#180A38] text-white"
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
                  disabled={isSubmittingOffer}
                  className="px-4 py-2 font-bold text-slate-950 bg-[#22C55E] hover:bg-emerald-400 rounded-lg transition-colors disabled:opacity-50"
                >
                  {isSubmittingOffer ? 'Gravando no Supabase...' : 'Publicar no Radar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

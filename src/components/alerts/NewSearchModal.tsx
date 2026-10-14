import React, { useState } from 'react';
import { useFlySync } from '../../store/FlySyncContext';
import { Modal } from '../common/Modal';
import { AirportSelect } from '../common/AirportSelect';
import { CabinClass, TripType } from '../../types';
import { PLANS } from '../../data/initialData';
import {
  Sparkles,
  AlertCircle,
  Bell,
  MessageSquare,
  Mail,
  Smartphone,
  Calendar,
  CheckCircle2,
  Zap,
  ArrowRight,
  ArrowLeftRight
} from 'lucide-react';

interface NewSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultOrigin?: string;
  defaultDestination?: string;
  defaultMaxMiles?: number;
  defaultProgramId?: string;
  onOpenUpgrade?: () => void;
}

export const NewSearchModal: React.FC<NewSearchModalProps> = ({
  isOpen,
  onClose,
  defaultOrigin = '',
  defaultDestination = '',
  defaultMaxMiles = 50000,
  defaultProgramId = '',
  onOpenUpgrade
}) => {
  const { user, programs, offers, savedSearches, addSavedSearch, pushPermission, requestPushPermission } = useFlySync();

  const [title, setTitle] = useState(defaultOrigin && defaultDestination ? `${defaultOrigin} para ${defaultDestination}` : '');
  const [origin, setOrigin] = useState(defaultOrigin || 'GRU');
  const [destination, setDestination] = useState(defaultDestination || 'MIA');
  const [maxMiles, setMaxMiles] = useState(defaultMaxMiles || 50000);
  const [programId, setProgramId] = useState(defaultProgramId || '');
  const [cabinClass, setCabinClass] = useState<CabinClass | ''>('');
  const [tripType, setTripType] = useState<TripType>('one_way');
  const [departureMonth, setDepartureMonth] = useState<string>(''); // e.g. '2026-11' or empty for any
  const [channels, setChannels] = useState<{ push: boolean }>({
    push: true
  });
  const [error, setError] = useState<string>('');

  const currentPlan = PLANS[user.plan];
  const activeCount = savedSearches.filter(s => s.isActive).length;
  const isLimitReached = activeCount >= currentPlan.maxSavedSearches;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!origin.trim() || !destination.trim()) {
      setError('Por favor, informe a sigla da origem e destino (ex: GRU e MIA).');
      return;
    }

    if (channels.push && pushPermission === 'default') {
      try {
        await requestPushPermission();
      } catch {
        // ignore
      }
    }

    const result = await addSavedSearch({
      title: title.trim() || `${origin.toUpperCase()} para ${destination.toUpperCase()}`,
      origin: origin.toUpperCase().trim(),
      destination: destination.toUpperCase().trim(),
      maxMiles: Number(maxMiles),
      programId: programId || undefined,
      cabinClass: cabinClass || undefined,
      departureMonth: departureMonth || undefined,
      pushEnabled: channels.push,
      alertFrequency: 'immediate'
    });

    if (!result.success) {
      setError(result.error || 'Não foi possível salvar esta busca.');
    } else {
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Nova Busca Salva & Monitoramento no Radar"
      subtitle="O motor do FlySync monitorará continuamente tarifas em tempo real e enviará alertas instantâneos."
      size="md"
    >
      {isLimitReached ? (
        <div className="py-4 space-y-4 text-slate-200">
          <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-500/40 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-200">
              <strong className="block text-sm font-bold mb-1 text-amber-300">
                Limite do Plano Gratuito Atingido ({currentPlan.maxSavedSearches} buscas)
              </strong>
              No plano Free, você pode monitorar até 2 buscas simultâneas. Faça o upgrade para o FlySync Premium para monitorar até 15 rotas e receber alertas prioritários imediatos via WhatsApp e Push.
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-[#160833] border border-purple-800/60 rounded-lg"
            >
              Voltar
            </button>
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenUpgrade?.();
              }}
              className="px-4 py-2 text-xs font-bold text-slate-950 bg-[#22C55E] hover:bg-emerald-400 rounded-lg flex items-center gap-1.5 shadow-[0_0_12px_rgba(34,197,94,0.3)] transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Ver Benefícios Premium
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 text-slate-200">
          {error && (
            <div className="p-3 bg-rose-950/60 text-rose-300 text-xs rounded-lg border border-rose-500/50">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Nome da Rota / Descrição
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Minhas férias em Miami / Sweet spot Madri"
              className="w-full px-3 py-2 text-xs border border-purple-800/80 rounded-lg bg-[#180838] text-white focus:ring-2 focus:ring-[#22C55E] focus:outline-hidden placeholder:text-slate-500"
            />
          </div>

          {/* Seletor Tipo de Viagem */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Tipo de Viagem
            </label>
            <div className="grid grid-cols-2 gap-2 bg-[#0F0324] p-1 rounded-xl border border-purple-900/60">
              <button
                type="button"
                onClick={() => setTripType('one_way')}
                className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  tripType === 'one_way'
                    ? 'bg-[#22C55E] text-slate-950 font-black shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Só Ida</span>
              </button>
              <button
                type="button"
                onClick={() => setTripType('round_trip')}
                className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  tripType === 'round_trip'
                    ? 'bg-[#22C55E] text-slate-950 font-black shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <ArrowLeftRight className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Ida e Volta</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <AirportSelect
              label="Origem (IATA / Cidade)"
              value={origin}
              onChange={(val) => setOrigin(val.toUpperCase())}
              placeholder="Ex: GRU, GIG..."
              iconType="takeoff"
              offers={offers}
              isOrigin={true}
              required
            />

            <AirportSelect
              label="Destino (IATA / Cidade)"
              value={destination}
              onChange={(val) => setDestination(val.toUpperCase())}
              placeholder="Ex: MIA, LIS, REC..."
              iconType="landing"
              offers={offers}
              isOrigin={false}
              required
            />
          </div>

          {/* Month Flexibility Selection (PRD 4.1) */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                Janela de Datas / Mês Desejado
              </span>
              <span className="text-[10px] text-cyan-300 font-normal">Flexibilidade multimeses</span>
            </label>
            <select
              value={departureMonth}
              onChange={(e) => setDepartureMonth(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-purple-800/80 rounded-lg bg-[#180838] text-white focus:ring-2 focus:ring-[#22C55E] focus:outline-hidden"
            >
              <option value="">Qualquer Mês (Monitorar o ano inteiro)</option>
              <option value="2026-11">Novembro / 2026</option>
              <option value="2026-12">Dezembro / 2026</option>
              <option value="2027-01">Janeiro / 2027</option>
              <option value="2027-02">Fevereiro / 2027</option>
              <option value="2027-03">Março / 2027</option>
              <option value="2027-04">Abril / 2027</option>
              <option value="2027-05">Maio / 2027</option>
            </select>
          </div>

          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-semibold text-slate-300">Teto Máximo de Milhas Desejado:</span>
              <span className="font-bold text-[#22C55E] font-mono tabular-nums">
                até {Number(maxMiles).toLocaleString('pt-BR')} milhas
              </span>
            </div>
            <input
              type="range"
              min={10000}
              max={150000}
              step={5000}
              value={maxMiles}
              onChange={(e) => setMaxMiles(Number(e.target.value))}
              className="w-full accent-[#22C55E] cursor-pointer"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Programa Preferencial
              </label>
              <select
                value={programId}
                onChange={(e) => setProgramId(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-purple-800/80 rounded-lg bg-[#180838] text-white focus:ring-2 focus:ring-[#22C55E] focus:outline-hidden"
              >
                <option value="">Qualquer programa</option>
                {programs.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Cabine Desejada
              </label>
              <select
                value={cabinClass}
                onChange={(e) => setCabinClass(e.target.value as any)}
                className="w-full px-3 py-2 text-xs border border-purple-800/80 rounded-lg bg-[#180838] text-white focus:ring-2 focus:ring-[#22C55E] focus:outline-hidden"
              >
                <option value="">Qualquer cabine</option>
                <option value="economy">Classe Econômica</option>
                <option value="premium_economy">Premium Economy</option>
                <option value="business">Classe Executiva</option>
              </select>
            </div>
          </div>

          {/* PRD 4.2 Channels selection */}
          <div className="p-3 rounded-xl bg-[#160833] border border-purple-900/60 space-y-2">
            <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
              Canais de Notificação Instantânea (Sem Latência)
            </span>
            <div className="flex items-center gap-4 text-xs">
              <label className="flex items-center gap-1.5 cursor-pointer text-[#22C55E]">
                <input
                  type="checkbox"
                  checked={true}
                  disabled
                  className="rounded-sm accent-[#22C55E]"
                />
                <Bell className="w-3.5 h-3.5 text-[#22C55E]" />
                <span>In-App (Central de Alertas)</span>
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer text-cyan-300">
                <input
                  type="checkbox"
                  checked={channels.push}
                  onChange={(e) => setChannels({ ...channels, push: e.target.checked })}
                  className="rounded-sm accent-[#38BDF8]"
                />
                <Smartphone className="w-3.5 h-3.5" />
                <span className="flex items-center gap-1">
                  <span>Push no Dispositivo</span>
                  <span className={`text-[9px] font-bold px-1 rounded-xs ${
                    pushPermission === 'granted'
                      ? 'bg-emerald-500/20 text-[#22C55E]'
                      : 'bg-amber-500/20 text-amber-300'
                  }`}>
                    {pushPermission === 'granted' ? 'Ativo' : 'Solicitar'}
                  </span>
                </span>
              </label>
            </div>
          </div>

          <div className="pt-3 border-t border-purple-900/40 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-[#160833] border border-purple-800/60 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-slate-950 bg-[#22C55E] hover:bg-emerald-400 rounded-lg shadow-[0_0_12px_rgba(34,197,94,0.3)] transition-all flex items-center gap-1.5"
            >
              <Zap className="w-3.5 h-3.5 fill-slate-950" />
              Ativar Monitoramento
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
};

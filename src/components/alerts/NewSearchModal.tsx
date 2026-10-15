import React, { useState, useMemo } from 'react';
import { useFlySync } from '../../store/FlySyncContext';
import { Modal } from '../common/Modal';
import { AirportSelect } from '../common/AirportSelect';
import { CabinClass, TripType } from '../../types';
import { PLANS } from '../../data/initialData';
import {
  Sparkles,
  AlertCircle,
  Bell,
  Smartphone,
  Calendar,
  Check,
  CheckCircle2,
  Zap,
  ArrowRight,
  ArrowLeftRight,
  Layers,
  Plane
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

const CABIN_OPTIONS: { id: CabinClass; label: string; badge: string }[] = [
  { id: 'economy', label: 'Econômica', badge: 'Economy' },
  { id: 'premium_economy', label: 'Premium Economy', badge: 'Premium' },
  { id: 'business', label: 'Executiva', badge: 'Executiva' },
  { id: 'first', label: 'Primeira Classe', badge: 'First' }
];

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

  // Estados principais simplificados e focados
  const [tripType, setTripType] = useState<TripType>('one_way');
  const [origin, setOrigin] = useState(defaultOrigin || 'GRU');
  const [destination, setDestination] = useState(defaultDestination || 'MIA');

  // Múltipla escolha de cabines (requisito do usuário)
  const [selectedCabins, setSelectedCabins] = useState<CabinClass[]>(['economy', 'business']);

  // Múltipla escolha de meses desejados
  const [selectedMonths, setSelectedMonths] = useState<string[]>([]); // vazio = Qualquer Mês

  // Preço máximo em milhas
  const [maxMiles, setMaxMiles] = useState(defaultMaxMiles || 50000);

  // Programa preferencial (opcional)
  const [programId, setProgramId] = useState(defaultProgramId || '');

  // Customização opcional do título
  const [customTitle, setCustomTitle] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const [channels, setChannels] = useState<{ push: boolean }>({ push: true });
  const [error, setError] = useState<string>('');

  const currentPlan = PLANS[user.plan];
  const activeCount = savedSearches.filter(s => s.isActive).length;
  const isLimitReached = activeCount >= currentPlan.maxSavedSearches;

  // Gera os próximos 8 meses a partir do momento atual
  const upcomingMonths = useMemo(() => {
    const list: { key: string; label: string }[] = [];
    const now = new Date();
    for (let i = 0; i < 9; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = d.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });
      list.push({ key, label });
    }
    return list;
  }, []);

  // Alterna uma cabine na múltipla escolha
  const toggleCabin = (cabin: CabinClass) => {
    setSelectedCabins(prev => {
      if (prev.includes(cabin)) {
        return prev.filter(c => c !== cabin);
      } else {
        return [...prev, cabin];
      }
    });
  };

  // Alterna um mês específico na múltipla escolha
  const toggleMonth = (monthKey: string) => {
    setSelectedMonths(prev => {
      if (prev.includes(monthKey)) {
        return prev.filter(m => m !== monthKey);
      } else {
        return [...prev, monthKey];
      }
    });
  };

  const handleSelectAllMonths = () => {
    setSelectedMonths([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!origin.trim() || !destination.trim()) {
      setError('Por favor, selecione os aeroportos de origem e destino.');
      return;
    }

    if (channels.push && pushPermission === 'default') {
      try {
        await requestPushPermission();
      } catch {
        // ignore
      }
    }

    const cabinLabels = selectedCabins
      .map(c => CABIN_OPTIONS.find(opt => opt.id === c)?.label)
      .filter(Boolean)
      .join(', ');

    const defaultTitle = `${origin.toUpperCase()} ➔ ${destination.toUpperCase()} (${tripType === 'round_trip' ? 'Ida e Volta' : 'Só Ida'}) · ${cabinLabels || 'Todas as Cabines'}`;

    const result = await addSavedSearch({
      title: customTitle.trim() || defaultTitle,
      origin: origin.toUpperCase().trim(),
      destination: destination.toUpperCase().trim(),
      maxMiles: Number(maxMiles),
      programId: programId || undefined,
      cabinClass: selectedCabins.length > 0 && selectedCabins.length < CABIN_OPTIONS.length
        ? selectedCabins.join(',')
        : undefined,
      departureMonth: selectedMonths.length > 0 ? selectedMonths.join(',') : undefined,
      tripType,
      pushEnabled: channels.push,
      alertFrequency: 'immediate'
    });

    if (!result.success) {
      setError(result.error || 'Não foi possível salvar este alerta.');
    } else {
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Criar Alerta no Radar de Milhas"
      subtitle="Defina sua rota, meses e cabines desejadas para receber notificações instantâneas de tarifas promocionais."
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
              className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-[#160833] border border-purple-800/60 rounded-lg cursor-pointer"
            >
              Voltar
            </button>
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenUpgrade?.();
              }}
              className="px-4 py-2 text-xs font-bold text-slate-950 bg-[#22C55E] hover:bg-emerald-400 rounded-lg flex items-center gap-1.5 shadow-[0_0_12px_rgba(34,197,94,0.3)] transition-colors cursor-pointer"
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

          {/* 1. SELETOR DE TIPO DE VIAGEM (SÓ IDA vs IDA E VOLTA) */}
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

          {/* 2. ROTA: ORIGEM & DESTINO COM AUTOCOMPLETE DE IATAS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <AirportSelect
              label="Origem (Aeroporto ou Cidade)"
              value={origin}
              onChange={(val) => setOrigin(val.toUpperCase())}
              placeholder="Ex: GRU, GIG, São Paulo..."
              iconType="takeoff"
              offers={offers}
              isOrigin={true}
              required
            />

            <AirportSelect
              label="Destino (Aeroporto ou Cidade)"
              value={destination}
              onChange={(val) => setDestination(val.toUpperCase())}
              placeholder="Ex: MIA, LIS, REC, Paris..."
              iconType="landing"
              offers={offers}
              isOrigin={false}
              required
            />
          </div>

          {/* 3. CABINES DESEJADAS (MÚLTIPLA ESCOLHA) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                Cabine Desejada (Múltipla Escolha)
              </label>
              <span className="text-[10px] text-cyan-300 font-medium">
                {selectedCabins.length === 0
                  ? 'Todas as cabines selecionadas'
                  : `${selectedCabins.length} de ${CABIN_OPTIONS.length} selecionada(s)`}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {CABIN_OPTIONS.map(cabin => {
                const isSelected = selectedCabins.includes(cabin.id);
                return (
                  <button
                    key={cabin.id}
                    type="button"
                    onClick={() => toggleCabin(cabin.id)}
                    className={`py-2 px-2.5 rounded-xl border text-left transition-all flex items-center justify-between gap-1.5 cursor-pointer ${
                      isSelected
                        ? 'bg-purple-900/80 border-[#22C55E] text-white shadow-sm ring-1 ring-[#22C55E]/40'
                        : 'bg-[#180838] border-purple-800/60 text-slate-400 hover:text-white hover:border-purple-700'
                    }`}
                  >
                    <span className="text-xs font-bold truncate">{cabin.label}</span>
                    <div className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 transition-all ${
                      isSelected
                        ? 'bg-[#22C55E] border-[#22C55E] text-slate-950'
                        : 'border-purple-700 bg-purple-950/50'
                    }`}>
                      {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. MESES DE VIAGEM (MÚLTIPLA ESCOLHA COM CHIPS) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                <span>Meses de Viagem</span>
              </label>
              <span className="text-[10px] text-cyan-300 font-medium">
                {selectedMonths.length === 0
                  ? 'Qualquer Mês (Monitorar o ano inteiro)'
                  : `${selectedMonths.length} mês(es) selecionado(s)`}
              </span>
            </div>

            <div className="flex flex-wrap gap-1.5 p-2 rounded-xl bg-[#0F0324] border border-purple-900/60 max-h-32 overflow-y-auto">
              {/* Botão Qualquer Mês */}
              <button
                type="button"
                onClick={handleSelectAllMonths}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  selectedMonths.length === 0
                    ? 'bg-[#22C55E] text-slate-950 font-black shadow-sm'
                    : 'bg-[#1B0A3D] text-slate-300 border border-purple-800/60 hover:text-white'
                }`}
              >
                Qualquer Mês (Todos)
              </button>

              {/* Chips dos Meses Específicos */}
              {upcomingMonths.map(m => {
                const isSelected = selectedMonths.includes(m.key);
                return (
                  <button
                    key={m.key}
                    type="button"
                    onClick={() => toggleMonth(m.key)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer capitalize ${
                      isSelected
                        ? 'bg-[#38BDF8] text-slate-950 font-black shadow-sm'
                        : 'bg-[#180838] text-slate-400 border border-purple-800/40 hover:text-white hover:border-purple-600'
                    }`}
                  >
                    <span>{m.label}</span>
                    {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 5. TETO MÁXIMO DE MILHAS */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-semibold text-slate-300">Teto Máximo de Preço:</span>
              <span className="font-bold text-[#22C55E] font-mono tabular-nums text-sm">
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

          {/* Opções Avançadas Opcionais (Nome Customizado e Programa) */}
          <div className="pt-1">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-[11px] text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1 cursor-pointer"
            >
              <span>{showAdvanced ? '− Ocultar opções avançadas' : '+ Mais opções (Programa e Apelido)'}</span>
            </button>

            {showAdvanced && (
              <div className="mt-2.5 p-3 rounded-xl bg-[#13062C] border border-purple-900/60 space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Programa Específico (Opcional)
                  </label>
                  <select
                    value={programId}
                    onChange={(e) => setProgramId(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-purple-800/80 rounded-lg bg-[#180838] text-white focus:ring-2 focus:ring-[#22C55E] focus:outline-hidden"
                  >
                    <option value="">Qualquer programa (Recomendado)</option>
                    {programs.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Apelido da Rota (Opcional)
                  </label>
                  <input
                    type="text"
                    value={customTitle}
                    onChange={(e) => setCustomTitle(e.target.value)}
                    placeholder="Ex: Minhas férias em Miami / Viagem dos sonhos"
                    className="w-full px-3 py-2 text-xs border border-purple-800/80 rounded-lg bg-[#180838] text-white focus:ring-2 focus:ring-[#22C55E] focus:outline-hidden placeholder:text-slate-500"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Notificação Push & In-App */}
          <div className="p-3 rounded-xl bg-[#160833] border border-purple-900/60 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-[#22C55E]" />
              <span className="font-semibold text-slate-200">Alertas Instantâneos Ativos</span>
            </div>
            <label className="flex items-center gap-1.5 cursor-pointer text-cyan-300">
              <input
                type="checkbox"
                checked={channels.push}
                onChange={(e) => setChannels({ ...channels, push: e.target.checked })}
                className="rounded-sm accent-[#38BDF8]"
              />
              <span className="text-[11px] font-bold">Push no Celular / Navegador</span>
            </label>
          </div>

          {/* Botões de Ação */}
          <div className="pt-3 border-t border-purple-900/40 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-[#160833] border border-purple-800/60 rounded-lg transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-slate-950 bg-[#22C55E] hover:bg-emerald-400 rounded-lg shadow-[0_0_12px_rgba(34,197,94,0.3)] transition-all flex items-center gap-1.5 cursor-pointer transform hover:scale-[1.02]"
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

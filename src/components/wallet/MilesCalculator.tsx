import React, { useState } from 'react';
import { useFlySync } from '../../store/FlySyncContext';
import {
  Calculator,
  Plane,
  Sparkles,
  RotateCcw
} from 'lucide-react';

interface RoutePreset {
  label: string;
  origin: string;
  destination: string;
  distanceKm: number;
}

const ROUTE_PRESETS: RoutePreset[] = [
  { label: 'SP ➔ Miami (GRU-MIA)', origin: 'GRU', destination: 'MIA', distanceKm: 6570 },
  { label: 'Rio ➔ Madri (GIG-MAD)', origin: 'GIG', destination: 'MAD', distanceKm: 8140 },
  { label: 'SP ➔ Lisboa (GRU-LIS)', origin: 'GRU', destination: 'LIS', distanceKm: 7925 },
  { label: 'Campinas ➔ Orlando (VCP-MCO)', origin: 'VCP', destination: 'MCO', distanceKm: 6820 },
  { label: 'Ponte Aérea (CGH-SDU)', origin: 'CGH', destination: 'SDU', distanceKm: 360 },
  { label: 'Brasília ➔ Salvador (BSB-SSA)', origin: 'BSB', destination: 'SSA', distanceKm: 1060 },
  { label: 'SP ➔ Buenos Aires (GRU-EZE)', origin: 'GRU', destination: 'EZE', distanceKm: 1720 }
];

export const MilesCalculator: React.FC = () => {
  const { programs } = useFlySync();

  // Inputs
  const [distance, setDistance] = useState<number>(6570);
  const [distanceUnit, setDistanceUnit] = useState<'km' | 'nm'>('km');
  const [isRoundTrip, setIsRoundTrip] = useState<boolean>(false);
  const [selectedProgramId, setSelectedProgramId] = useState<string>(programs[0]?.id || 'prog-smiles');
  const [fareMultiplier, setFareMultiplier] = useState<number>(1.0); // 100%
  const [eliteTierBonus, setEliteTierBonus] = useState<number>(0.0); // 0%
  const [isCustomMultiplier, setIsCustomMultiplier] = useState<boolean>(false);
  const [customMultiplier, setCustomMultiplier] = useState<number>(100); // 100%

  // Selected program info
  const selectedProgram = programs.find((p) => p.id === selectedProgramId) || programs[0];

  // Convert distance to km for calculation baseline
  const effectiveDistanceKm = distanceUnit === 'nm' ? Math.round(distance * 1.852) : distance;
  const legDistance = isRoundTrip ? effectiveDistanceKm * 2 : effectiveDistanceKm;

  // Multiplier calculation
  const totalMultiplier = isCustomMultiplier
    ? customMultiplier / 100
    : fareMultiplier * (1 + eliteTierBonus);

  const baseMiles = Math.round(legDistance * (isCustomMultiplier ? customMultiplier / 100 : fareMultiplier));
  const eliteBonusMiles = isCustomMultiplier ? 0 : Math.round(baseMiles * eliteTierBonus);
  const totalEstimatedMiles = baseMiles + eliteBonusMiles;

  // Approximate economic value
  const milheiroValue = selectedProgram?.unitLabel === 'Avios' ? 38.0 : selectedProgram?.category === 'bank' ? 32.0 : 18.5;
  const estimatedMonetaryValue = (totalEstimatedMiles / 1000) * milheiroValue;

  const handleApplyPreset = (preset: RoutePreset) => {
    if (distanceUnit === 'km') {
      setDistance(preset.distanceKm);
    } else {
      setDistance(Math.round(preset.distanceKm / 1.852));
    }
  };

  const handleReset = () => {
    setDistance(6570);
    setDistanceUnit('km');
    setIsRoundTrip(false);
    setFareMultiplier(1.0);
    setEliteTierBonus(0.0);
    setIsCustomMultiplier(false);
    setCustomMultiplier(100);
  };

  return (
    <div className="p-6 rounded-2xl bg-[#13062C] border border-purple-900/60 shadow-xl space-y-6 text-white">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-purple-900/40">
        <div>
          <div className="flex items-center gap-2 text-xs text-purple-300 font-semibold mb-1">
            <Calculator className="w-4 h-4 text-[#38BDF8]" />
            <span>Simulador de Acúmulo por Distância de Voo</span>
            <span aria-hidden="true">·</span>
            <span className="text-[#22C55E]">Planejamento de Viagens Futuras</span>
          </div>
          <h3 className="text-lg font-bold text-white tracking-tight">
            Calculadora de Milhas por Voo
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Estime quantas milhas ou pontos você acumulará com base na distância da rota percorrida e no multiplicador tarifário da companhia aérea.
          </p>
        </div>

        <button
          onClick={handleReset}
          className="self-start sm:self-auto px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-[#1A0B3B] border border-purple-800/60 rounded-lg transition-colors flex items-center gap-1.5"
          title="Restaurar valores padrão"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Redefinir</span>
        </button>
      </div>

      {/* Preset Route Buttons */}
      <div>
        <span className="text-[11px] font-semibold text-slate-400 block mb-2 flex items-center gap-1">
          <Plane className="w-3 h-3 text-[#38BDF8]" />
          Rotas frequentes para estimativa rápida:
        </span>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {ROUTE_PRESETS.map((preset, idx) => (
            <button
              key={idx}
              onClick={() => handleApplyPreset(preset)}
              className="px-2.5 py-1 rounded-md bg-[#1A0B3B] hover:bg-purple-900/60 text-slate-300 hover:text-white border border-purple-800/60 whitespace-nowrap font-medium transition-colors"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Inputs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* Input 1: Distance & Unit */}
        <div className="space-y-3">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-300">
                Distância do Voo
              </label>
              <div className="inline-flex rounded-md p-0.5 bg-purple-950/80 border border-purple-900 text-[11px]">
                <button
                  type="button"
                  onClick={() => setDistanceUnit('km')}
                  className={`px-2 py-0.5 rounded-sm font-semibold transition-colors ${
                    distanceUnit === 'km'
                      ? 'bg-[#22C55E] text-slate-950 font-bold shadow-xs'
                      : 'text-slate-400'
                  }`}
                >
                  km
                </button>
                <button
                  type="button"
                  onClick={() => setDistanceUnit('nm')}
                  className={`px-2 py-0.5 rounded-sm font-semibold transition-colors ${
                    distanceUnit === 'nm'
                      ? 'bg-[#22C55E] text-slate-950 font-bold shadow-xs'
                      : 'text-slate-400'
                  }`}
                >
                  NM
                </button>
              </div>
            </div>

            <div className="relative">
              <input
                type="number"
                min={50}
                max={25000}
                step={10}
                value={distance}
                onChange={(e) => setDistance(Math.max(0, Number(e.target.value)))}
                className="w-full px-3 py-2 text-sm font-mono tabular-nums bg-[#1A0B3B] border border-purple-800/80 rounded-lg text-white focus:ring-2 focus:ring-[#22C55E] focus:outline-hidden"
              />
              <span className="absolute right-3 top-2.5 text-xs text-slate-400 uppercase font-semibold">
                {distanceUnit}
              </span>
            </div>
          </div>

          {/* Direction toggle */}
          <div className="pt-1">
            <label className="flex items-center gap-2 p-2.5 rounded-lg border border-purple-800/60 bg-[#1A0B3B]/60 cursor-pointer text-xs text-slate-200">
              <input
                type="checkbox"
                checked={isRoundTrip}
                onChange={(e) => setIsRoundTrip(e.target.checked)}
                className="rounded-sm text-[#22C55E] focus:ring-[#22C55E]"
              />
              <span className="font-medium">
                Voo de Ida e Volta (Duplicar distância: 2x)
              </span>
            </label>
          </div>
        </div>

        {/* Input 2: Program & Multiplier Mode */}
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Programa de Fidelidade Destino
            </label>
            <select
              value={selectedProgramId}
              onChange={(e) => setSelectedProgramId(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-purple-800/80 rounded-lg bg-[#1A0B3B] text-white focus:ring-2 focus:ring-[#22C55E] focus:outline-hidden"
            >
              {programs.map((p) => (
                <option key={p.id} value={p.id} className="bg-[#13062C] text-white">
                  {p.name} ({p.unitLabel}) · {p.category === 'bank' ? 'Bancário' : 'Aéreo'}
                </option>
              ))}
            </select>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-300">
                Multiplicador Tarifário
              </label>
              <label className="text-xs text-[#22C55E] flex items-center gap-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isCustomMultiplier}
                  onChange={(e) => setIsCustomMultiplier(e.target.checked)}
                  className="rounded-sm text-[#22C55E] focus:ring-[#22C55E]"
                />
                Personalizado
              </label>
            </div>

            {!isCustomMultiplier ? (
              <select
                value={fareMultiplier}
                onChange={(e) => setFareMultiplier(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs border border-purple-800/80 rounded-lg bg-[#1A0B3B] text-white focus:ring-2 focus:ring-[#22C55E] focus:outline-hidden"
              >
                <option value={0.5} className="bg-[#13062C]">Promo / Light (50% da distância)</option>
                <option value={1.0} className="bg-[#13062C]">Básica / Standard (100% da distância)</option>
                <option value={1.5} className="bg-[#13062C]">Flex / Premium Economy (150% da distância)</option>
                <option value={2.0} className="bg-[#13062C]">Classe Executiva (200% da distância)</option>
                <option value={3.0} className="bg-[#13062C]">Primeira Classe (300% da distância)</option>
              </select>
            ) : (
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-slate-400">Taxa de Acúmulo:</span>
                  <span className="font-bold font-mono tabular-nums text-[#22C55E]">
                    {customMultiplier}% da distância
                  </span>
                </div>
                <input
                  type="range"
                  min={25}
                  max={400}
                  step={5}
                  value={customMultiplier}
                  onChange={(e) => setCustomMultiplier(Number(e.target.value))}
                  className="w-full accent-[#22C55E] cursor-pointer"
                />
              </div>
            )}
          </div>
        </div>

        {/* Input 3: Elite Tier Bonus */}
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Categoria Elite do Passageiro
            </label>
            <select
              value={eliteTierBonus}
              disabled={isCustomMultiplier}
              onChange={(e) => setEliteTierBonus(Number(e.target.value))}
              className="w-full px-3 py-2 text-xs border border-purple-800/80 rounded-lg bg-[#1A0B3B] text-white focus:ring-2 focus:ring-[#22C55E] focus:outline-hidden disabled:opacity-50"
            >
              <option value={0.0} className="bg-[#13062C]">Membro Básico (+0% bônus)</option>
              <option value={0.25} className="bg-[#13062C]">Prata / Silver (+25% bônus elite)</option>
              <option value={0.50} className="bg-[#13062C]">Ouro / Gold (+50% bônus elite)</option>
              <option value={1.00} className="bg-[#13062C]">Diamante / Black (+100% bônus elite)</option>
            </select>
            <p className="text-[11px] text-slate-400 mt-1">
              Bonificação adicional sobre a tarifa base para passageiros frequentes.
            </p>
          </div>

          <div className="p-3 rounded-lg bg-[#1A0B3B]/70 border border-purple-900/60 text-[11px] text-slate-300 space-y-1">
            <div className="flex items-center justify-between">
              <span>Distância computada:</span>
              <strong className="font-mono tabular-nums text-white">{legDistance.toLocaleString('pt-BR')} km</strong>
            </div>
            <div className="flex items-center justify-between">
              <span>Multiplicador consolidado:</span>
              <strong className="font-mono tabular-nums text-[#22C55E]">{(totalMultiplier * 100).toFixed(0)}%</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Results Card with Cyan & Emerald Theme */}
      <div className="p-5 rounded-xl bg-gradient-to-r from-[#180A38] to-[#12052B] border border-purple-800/70 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-md">
        <div>
          <div className="flex items-center gap-2 text-xs text-purple-300 mb-1">
            <Sparkles className="w-4 h-4 text-[#22C55E]" />
            <span>Estimativa de Acúmulo no {selectedProgram.name}</span>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-black font-mono tabular-nums text-[#22C55E] tracking-tight">
              +{totalEstimatedMiles.toLocaleString('pt-BR')}
            </span>
            <span className="text-sm uppercase font-extrabold text-cyan-300">
              {selectedProgram.unitLabel}
            </span>
          </div>

          <p className="text-xs text-slate-300 mt-1">
            Valor de mercado estimado deste lote de milhas: <strong className="text-white">~R$ {estimatedMonetaryValue.toFixed(2)}</strong>
          </p>
        </div>

        {/* Breakdown Badges */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 text-xs">
          <div className="p-2.5 rounded-lg bg-[#0F0422] border border-purple-800/80">
            <span className="text-[10px] text-slate-400 block">Acúmulo Base:</span>
            <strong className="font-mono tabular-nums text-white">{baseMiles.toLocaleString('pt-BR')} pts</strong>
          </div>

          {eliteBonusMiles > 0 && (
            <div className="p-2.5 rounded-lg bg-[#0F0422] border border-purple-800/80">
              <span className="text-[10px] text-[#22C55E] block">Bônus de Categoria:</span>
              <strong className="font-mono tabular-nums text-[#22C55E]">+{eliteBonusMiles.toLocaleString('pt-BR')} pts</strong>
            </div>
          )}

          <div className="p-2.5 rounded-lg bg-[#0F0422] border border-purple-800/80">
            <span className="text-[10px] text-slate-400 block">Sentido:</span>
            <strong className="text-white">{isRoundTrip ? 'Ida e Volta' : 'Somente Ida'}</strong>
          </div>
        </div>
      </div>
    </div>
  );
};

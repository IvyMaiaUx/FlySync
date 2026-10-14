import React, { useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import { TrendingUp, Calendar, Sparkles } from 'lucide-react';

interface MonthlyDataPoint {
  month: string;
  shortMonth: string;
  airlineMiles: number; // Smiles, Latam, Azul, TAP
  bankPoints: number; // Livelo, Esfera
  avios: number; // Iberia
  totalAccumulated: number;
}

const MONTHLY_TREND_DATA: MonthlyDataPoint[] = [
  { month: 'Novembro 2025', shortMonth: 'Nov/25', airlineMiles: 14200, bankPoints: 12000, avios: 3500, totalAccumulated: 29700 },
  { month: 'Dezembro 2025', shortMonth: 'Dez/25', airlineMiles: 22500, bankPoints: 18400, avios: 4200, totalAccumulated: 45100 },
  { month: 'Janeiro 2026', shortMonth: 'Jan/26', airlineMiles: 16800, bankPoints: 14100, avios: 2800, totalAccumulated: 33700 },
  { month: 'Fevereiro 2026', shortMonth: 'Fev/26', airlineMiles: 19400, bankPoints: 11500, avios: 3100, totalAccumulated: 34000 },
  { month: 'Março 2026', shortMonth: 'Mar/26', airlineMiles: 28900, bankPoints: 22000, avios: 5000, totalAccumulated: 55900 },
  { month: 'Abril 2026', shortMonth: 'Abr/26', airlineMiles: 15300, bankPoints: 13000, avios: 2400, totalAccumulated: 30700 },
  { month: 'Maio 2026', shortMonth: 'Mai/26', airlineMiles: 24100, bankPoints: 16500, avios: 4500, totalAccumulated: 45100 },
  { month: 'Junho 2026', shortMonth: 'Jun/26', airlineMiles: 18200, bankPoints: 15200, avios: 3900, totalAccumulated: 37300 },
  { month: 'Julho 2026', shortMonth: 'Jul/26', airlineMiles: 34500, bankPoints: 24800, avios: 6200, totalAccumulated: 65500 }, // Promo bonificada
  { month: 'Agosto 2026', shortMonth: 'Ago/26', airlineMiles: 21000, bankPoints: 14300, avios: 4100, totalAccumulated: 39400 },
  { month: 'Setembro 2026', shortMonth: 'Set/26', airlineMiles: 26400, bankPoints: 17900, avios: 4800, totalAccumulated: 49100 },
  { month: 'Outubro 2026', shortMonth: 'Out/26', airlineMiles: 28100, bankPoints: 20500, avios: 5200, totalAccumulated: 53800 }
];

export const MonthlyTrendsChart: React.FC = () => {
  const [viewMode, setViewMode] = useState<'all' | 'categories'>('all');

  // Stats calculation
  const total12Months = MONTHLY_TREND_DATA.reduce((sum, d) => sum + d.totalAccumulated, 0);
  const avgMonthly = Math.round(total12Months / MONTHLY_TREND_DATA.length);
  const bestMonth = [...MONTHLY_TREND_DATA].sort((a, b) => b.totalAccumulated - a.totalAccumulated)[0];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const dataPoint = MONTHLY_TREND_DATA.find(d => d.shortMonth === label);
      return (
        <div className="p-3 bg-[#0A0218] text-white rounded-xl shadow-2xl border border-purple-800 text-xs space-y-1.5 font-sans">
          <p className="font-bold text-slate-200 border-b border-purple-900 pb-1">
            {dataPoint?.month || label}
          </p>
          {payload.map((entry: any, index: number) => (
            <div key={`item-${index}`} className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-1.5 text-slate-300">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: entry.color }}
                />
                {entry.name}:
              </span>
              <strong className="font-mono tabular-nums text-white">
                {entry.value.toLocaleString('pt-BR')} pts
              </strong>
            </div>
          ))}
          {viewMode === 'categories' && dataPoint && (
            <div className="pt-1 border-t border-purple-900 flex items-center justify-between text-[11px] text-[#22C55E] font-semibold">
              <span>Total no mês:</span>
              <span className="font-mono tabular-nums">
                {dataPoint.totalAccumulated.toLocaleString('pt-BR')} pts
              </span>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-6 rounded-2xl bg-[#13062C] border border-purple-900/60 shadow-xl space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-purple-900/40">
        <div>
          <div className="flex items-center gap-2 text-xs text-purple-300 font-semibold mb-1">
            <TrendingUp className="w-4 h-4 text-[#38BDF8]" />
            <span>Evolução Histórica & Histórico de Acúmulo</span>
            <span aria-hidden="true">·</span>
            <span className="text-[#22C55E]">Últimos 12 Meses</span>
          </div>
          <h3 className="text-lg font-bold text-white tracking-tight">
            Tendência Mensal de Acúmulo de Milhas
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Acompanhe o ritmo de entrada de pontos e identifique os meses com maior geração por cartões, voos e bonificações.
          </p>
        </div>

        {/* View mode toggle */}
        <div className="inline-flex rounded-lg p-0.5 bg-purple-950/80 border border-purple-900 text-xs self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setViewMode('all')}
            className={`px-3 py-1.5 rounded-md font-semibold transition-colors ${
              viewMode === 'all'
                ? 'bg-[#22C55E] text-slate-950 font-bold shadow-xs'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            Total Consolidado
          </button>
          <button
            type="button"
            onClick={() => setViewMode('categories')}
            className={`px-3 py-1.5 rounded-md font-semibold transition-colors ${
              viewMode === 'categories'
                ? 'bg-[#22C55E] text-slate-950 font-bold shadow-xs'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            Por Categoria
          </button>
        </div>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3.5 rounded-xl bg-[#1A0B3B] border border-purple-900/60">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Total Gerado no Ano
          </span>
          <div className="text-2xl font-black text-white font-mono tabular-nums mt-0.5">
            {total12Months.toLocaleString('pt-BR')}
          </div>
          <span className="text-[11px] text-slate-400">Pontos e milhas somados</span>
        </div>

        <div className="p-3.5 rounded-xl bg-[#1A0B3B] border border-purple-900/60">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Média Mensal de Geração
          </span>
          <div className="text-2xl font-black text-[#22C55E] font-mono tabular-nums mt-0.5">
            {avgMonthly.toLocaleString('pt-BR')}
          </div>
          <span className="text-[11px] text-slate-400">Milhas / mês</span>
        </div>

        <div className="p-3.5 rounded-xl bg-[#1A0B3B] border border-purple-900/60">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Mês Recorde ({bestMonth.shortMonth})
          </span>
          <div className="text-2xl font-black text-[#38BDF8] font-mono tabular-nums mt-0.5">
            {bestMonth.totalAccumulated.toLocaleString('pt-BR')}
          </div>
          <span className="text-[11px] text-cyan-400 font-medium">Campanha bonificada ativa</span>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="h-72 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={MONTHLY_TREND_DATA}
            margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#2D1658" />
            <XAxis
              dataKey="shortMonth"
              tickLine={false}
              axisLine={{ stroke: '#3B1D70' }}
              tick={{ fill: '#94A3B8', fontSize: 11 }}
            />
            <YAxis
              tickLine={false}
              axisLine={{ stroke: '#3B1D70' }}
              tick={{ fill: '#94A3B8', fontSize: 11 }}
              tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ paddingTop: '12px', fontSize: '12px' }}
              iconType="circle"
            />

            {viewMode === 'all' ? (
              <Line
                type="monotone"
                dataKey="totalAccumulated"
                name="Total Consolidado de Milhas"
                stroke="#22C55E" // Neon Green from Logo ticket
                strokeWidth={3}
                dot={{ r: 4, fill: '#22C55E', strokeWidth: 2, stroke: '#0C021E' }}
                activeDot={{ r: 6, fill: '#38BDF8', stroke: '#FFFFFF', strokeWidth: 2 }}
              />
            ) : (
              <>
                <Line
                  type="monotone"
                  dataKey="airlineMiles"
                  name="Milhas Aéreas (Smiles/LATAM/Azul)"
                  stroke="#FF6700"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: '#FF6700' }}
                />
                <Line
                  type="monotone"
                  dataKey="bankPoints"
                  name="Pontos Bancários (Livelo/Esfera)"
                  stroke="#22C55E"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: '#22C55E' }}
                />
                <Line
                  type="monotone"
                  dataKey="avios"
                  name="Avios & Internacionais"
                  stroke="#38BDF8"
                  strokeWidth={2}
                  dot={{ r: 3, fill: '#38BDF8' }}
                />
              </>
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Informative Legend footer */}
      <div className="pt-2 border-t border-purple-900/40 flex items-center justify-between text-[11px] text-slate-400">
        <span>Dados apurados com base no histórico de conciliações e cartões cadastrados.</span>
        <span className="text-[#22C55E]">FlySync Analytics</span>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { useFlySync } from '../../store/FlySyncContext';
import {
  BellRing,
  Send,
  Sparkles,
  Zap,
  Flame,
  CheckCircle2,
  Clock,
  Users,
  Radio,
  ExternalLink,
  Crown,
  Eye,
  AlertCircle
} from 'lucide-react';

export const AdminBroadcastTab: React.FC = () => {
  const { broadcasts, adminSendBroadcast, users } = useFlySync();

  const [title, setTitle] = useState('🔥 Oportunidade: Miami por 38.000 milhas Smiles!');
  const [message, setMessage] = useState('Tarifa promocional encontrada para voar direto saindo de São Paulo (GRU) em novembro.');
  const [category, setCategory] = useState<'radar' | 'price_drop' | 'bonus' | 'system'>('price_drop');
  const [targetPlan, setTargetPlan] = useState<'all' | 'premium' | 'free'>('all');
  const [targetRoute, setTargetRoute] = useState('GRU → MIA');
  const [isSending, setIsSending] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);

  // Audience size calculation
  const audienceCount = users.filter(u => {
    if (targetPlan === 'all') return true;
    return u.plan === targetPlan;
  }).length;

  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;

    setIsSending(true);
    await adminSendBroadcast({
      title,
      message,
      category,
      targetPlan,
      targetRoute: targetRoute.trim() ? targetRoute.toUpperCase() : undefined
    });
    setIsSending(false);
    setSentSuccess(true);
    setTimeout(() => setSentSuccess(false), 3500);
  };

  const categoryLabels = {
    radar: { label: 'Oferta no Radar', icon: Radio, color: 'text-purple-400 bg-purple-500/15 border-purple-500/30' },
    price_drop: { label: 'Queda / Bug Tarifa', icon: Flame, color: 'text-amber-400 bg-amber-500/15 border-amber-500/30' },
    bonus: { label: 'Bônus de Transferência', icon: Sparkles, color: 'text-emerald-400 bg-emerald-500/15 border-emerald-500/30' },
    system: { label: 'Comunicado Oficial', icon: BellRing, color: 'text-sky-400 bg-sky-500/15 border-sky-500/30' }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <BellRing className="w-4 h-4 text-emerald-400" />
          <span>Central de Disparo de Alertas & Push Broadcast</span>
        </h3>
        <p className="text-xs text-purple-300">
          Envie notificações push em tempo real para os dispositivos dos passageiros e monitore o alcance dos disparos.
        </p>
      </div>

      {/* Main Grid: Composer & Live Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Form Composer (7 cols) */}
        <form
          onSubmit={handleSendBroadcast}
          className="lg:col-span-7 p-5 rounded-2xl bg-[#12052C] border border-purple-900/70 shadow-xl space-y-4"
        >
          <div className="flex items-center justify-between pb-2 border-b border-purple-900/50">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-300">
              Compor Notificação em Massa
            </span>
            <span className="text-xs text-purple-400">
              Público estimado: <strong className="text-amber-300 font-bold">{audienceCount * 140 + 35} passageiros</strong>
            </span>
          </div>

          {/* Category selection */}
          <div>
            <label className="text-[11px] font-bold uppercase text-purple-300 block mb-1.5">
              Tipo do Alerta
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              {(Object.keys(categoryLabels) as Array<keyof typeof categoryLabels>).map((cat) => {
                const Item = categoryLabels[cat];
                const Icon = Item.icon;
                const isSelected = category === cat;

                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={`p-2.5 rounded-xl border text-left font-bold transition-all flex flex-col gap-1 ${
                      isSelected
                        ? 'border-amber-400 bg-amber-400/15 text-white shadow-sm'
                        : 'border-purple-900/60 bg-[#180a33] text-purple-300 hover:text-white hover:bg-purple-900/40'
                    }`}
                  >
                    <Icon className="w-4 h-4 text-amber-400" />
                    <span className="text-[11px]">{Item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Target Audience */}
          <div>
            <label className="text-[11px] font-bold uppercase text-purple-300 block mb-1.5">
              Segmento de Usuários (Público-Alvo)
            </label>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <button
                type="button"
                onClick={() => setTargetPlan('all')}
                className={`py-2 px-3 rounded-xl border font-bold text-center transition-all ${
                  targetPlan === 'all'
                    ? 'border-emerald-500 bg-emerald-500/20 text-emerald-300'
                    : 'border-purple-900/60 bg-[#180a33] text-purple-300 hover:text-white'
                }`}
              >
                Todos ({users.length})
              </button>
              <button
                type="button"
                onClick={() => setTargetPlan('premium')}
                className={`py-2 px-3 rounded-xl border font-bold text-center transition-all flex items-center justify-center gap-1 ${
                  targetPlan === 'premium'
                    ? 'border-emerald-500 bg-emerald-500/20 text-emerald-300'
                    : 'border-purple-900/60 bg-[#180a33] text-purple-300 hover:text-white'
                }`}
              >
                <Crown className="w-3.5 h-3.5 text-amber-400" />
                <span>Exclusivo VIP ({users.filter(u => u.plan === 'premium').length})</span>
              </button>
              <button
                type="button"
                onClick={() => setTargetPlan('free')}
                className={`py-2 px-3 rounded-xl border font-bold text-center transition-all ${
                  targetPlan === 'free'
                    ? 'border-emerald-500 bg-emerald-500/20 text-emerald-300'
                    : 'border-purple-900/60 bg-[#180a33] text-purple-300 hover:text-white'
                }`}
              >
                Apenas Free ({users.filter(u => u.plan === 'free').length})
              </button>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="text-[11px] font-bold uppercase text-purple-300 block mb-1">
              Título do Alerta (máx. 65 caracteres)
            </label>
            <input
              type="text"
              required
              maxLength={65}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: 🔥 Miami por 38.000 milhas Smiles!"
              className="w-full px-3.5 py-2.5 bg-[#180a33] border border-purple-800 rounded-xl text-xs text-white placeholder-purple-400/50 focus:outline-hidden focus:ring-2 focus:ring-emerald-400/60 font-semibold"
            />
            <div className="text-right text-[10px] text-purple-400 mt-0.5">{title.length}/65</div>
          </div>

          {/* Route (Optional) */}
          <div>
            <label className="text-[11px] font-bold uppercase text-purple-300 block mb-1">
              Trecho Relacionado (Opcional)
            </label>
            <input
              type="text"
              value={targetRoute}
              onChange={(e) => setTargetRoute(e.target.value.toUpperCase())}
              placeholder="Ex: GRU → MIA ou GIG → LIS"
              className="w-full px-3.5 py-2.5 bg-[#180a33] border border-purple-800 rounded-xl text-xs text-white placeholder-purple-400/50 focus:outline-hidden focus:ring-2 focus:ring-emerald-400/60 font-mono font-bold"
            />
          </div>

          {/* Message Content */}
          <div>
            <label className="text-[11px] font-bold uppercase text-purple-300 block mb-1">
              Texto da Notificação Push
            </label>
            <textarea
              required
              rows={3}
              maxLength={160}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Mensagem clara que convida o usuário a abrir o FlySync..."
              className="w-full px-3.5 py-2 bg-[#180a33] border border-purple-800 rounded-xl text-xs text-white placeholder-purple-400/50 focus:outline-hidden focus:ring-2 focus:ring-emerald-400/60 resize-none"
            />
            <div className="text-right text-[10px] text-purple-400">{message.length}/160</div>
          </div>

          {sentSuccess && (
            <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Notificação push transmitida com sucesso para todos os usuários inscritos!</span>
            </div>
          )}

          {/* Submit Action */}
          <button
            type="submit"
            disabled={isSending}
            className="w-full py-3 bg-gradient-to-r from-[#22C55E] to-emerald-400 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-black rounded-xl text-xs flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(34,197,94,0.35)] transition-all disabled:opacity-50 cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span>{isSending ? 'Transmitindo Alertas Push...' : 'Disparar Push Notification Agora'}</span>
          </button>
        </form>

        {/* Live Device Preview (5 cols) */}
        <div className="lg:col-span-5 p-5 rounded-2xl bg-[#12052C] border border-purple-900/70 shadow-xl space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-purple-300">
            <Eye className="w-4 h-4 text-sky-400" />
            <span>Pré-visualização no Dispositivo</span>
          </div>

          {/* Mobile Notification Card Simulation */}
          <div className="p-4 rounded-2xl bg-black/60 border border-purple-800/80 shadow-2xl space-y-2">
            <div className="flex items-center justify-between text-[11px] text-slate-400 pb-1 border-b border-white/5">
              <div className="flex items-center gap-1.5">
                <div className="w-4 h-4 rounded-md bg-[#22C55E] flex items-center justify-center text-slate-950 font-black text-[9px]">
                  F
                </div>
                <strong className="text-white">FlySync Radar</strong>
              </div>
              <span>agora mesmo</span>
            </div>

            <div className="pt-1">
              <h5 className="text-xs font-bold text-white leading-snug">{title || 'Título do Alerta'}</h5>
              <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                {message || 'Corpo da notificação detalhando o achado promocional...'}
              </p>
            </div>

            {targetRoute && (
              <div className="pt-2 flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-purple-900/60 text-purple-200 border border-purple-700/60">
                  {targetRoute}
                </span>
                <span className="text-[10px] font-bold text-emerald-400">
                  Toque para abrir no App
                </span>
              </div>
            )}
          </div>

          {/* Info pill */}
          <div className="p-3 rounded-xl bg-purple-950/50 border border-purple-800/60 text-[11px] text-purple-300 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-amber-300">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Garantia de Entrega Push</span>
            </div>
            <p>
              O FlySync utiliza a Web Push API oficial combinada com Service Workers para exibir a notificação mesmo se a aba estiver em segundo plano.
            </p>
          </div>
        </div>
      </div>

      {/* Broadcast History Table */}
      <div className="p-5 rounded-2xl bg-[#12052C] border border-purple-900/70 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold uppercase tracking-wider text-white">
            Histórico de Disparos Recentes ({broadcasts.length})
          </h4>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-purple-900/60 text-purple-300 font-semibold uppercase text-[10px]">
                <th className="py-2.5 px-3">Título & Trecho</th>
                <th className="py-2.5 px-3">Tipo</th>
                <th className="py-2.5 px-3">Segmento</th>
                <th className="py-2.5 px-3">Data/Hora</th>
                <th className="py-2.5 px-3">Disparados</th>
                <th className="py-2.5 px-3">Aberturas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-purple-900/40">
              {broadcasts.map((bc) => {
                const Item = categoryLabels[bc.category] || categoryLabels.radar;
                const Icon = Item.icon;
                return (
                  <tr key={bc.id} className="hover:bg-purple-900/20 transition-colors">
                    <td className="py-3 px-3">
                      <strong className="text-white block font-bold">{bc.title}</strong>
                      <span className="text-[11px] text-purple-300 truncate max-w-sm block">
                        {bc.message}
                      </span>
                      {bc.targetRoute && (
                        <span className="inline-block mt-1 text-[10px] font-mono font-bold text-amber-300 bg-amber-500/15 border border-amber-500/30 px-1.5 py-0.5 rounded">
                          {bc.targetRoute}
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border ${Item.color}`}>
                        <Icon className="w-3 h-3" />
                        <span>{Item.label}</span>
                      </span>
                    </td>

                    <td className="py-3 px-3">
                      <span className="capitalize font-semibold text-slate-300">
                        {bc.targetPlan === 'all' ? 'Todos' : bc.targetPlan === 'premium' ? 'VIP Pro' : 'Free'}
                      </span>
                    </td>

                    <td className="py-3 px-3 font-mono text-[11px] text-purple-300">
                      {new Date(bc.sentAt).toLocaleString('pt-BR')}
                    </td>

                    <td className="py-3 px-3 font-mono font-bold text-white">
                      {bc.sentCount.toLocaleString()}
                    </td>

                    <td className="py-3 px-3 font-mono font-bold text-emerald-400">
                      {bc.openCount > 0 ? `${bc.openCount} (${((bc.openCount / bc.sentCount) * 100).toFixed(0)}%)` : 'Em andamento'}
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

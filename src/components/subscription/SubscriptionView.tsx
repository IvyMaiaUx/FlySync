import React, { useState } from 'react';
import { useFlySync } from '../../store/FlySyncContext';
import { CheckoutModal } from './CheckoutModal';
import { PLANS } from '../../data/initialData';
import {
  Sparkles,
  Check,
  Zap,
  Plane,
  ShieldCheck,
  TrendingDown,
  MessageSquare,
  Award,
  Crown,
  Lock,
  ArrowRight,
  Flame,
  CheckCircle2,
  Clock,
  HelpCircle,
  ChevronDown
} from 'lucide-react';

export const SubscriptionView: React.FC = () => {
  const { user, subscription, paymentEvents, cancelSubscription } = useFlySync();
  const [billingInterval, setBillingInterval] = useState<'month' | 'year'>('year');
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const isPremium = user.plan === 'premium' || subscription?.status === 'active';

  const comparisonFeatures = [
    { label: 'Gestão de saldo por programa', free: 'Manual básica', premium: 'Ilimitada consolidada' },
    { label: 'Feed do Radar de Ofertas', free: 'Apenas Econômica', premium: 'Econômica + Executiva + 1ª Classe' },
    { label: 'Alertas no WhatsApp em Tempo Real', free: 'Não disponível', premium: 'Instantâneo VIP (Menos de 60s)' },
    { label: 'Buscas salvas monitoradas simultâneas', free: 'Até 2 rotas', premium: 'Até 15 rotas prioritárias' },
    { label: 'Velocidade dos alertas de tarifa', free: 'Resumo diário (24h)', premium: 'Imediato (Push + WhatsApp + E-mail)' },
    { label: 'Histórico & Algoritmo Preditivo', free: 'Não disponível', premium: 'Termômetro & Análise de Tendência' },
    { label: 'Comparativo Multi-Programa', free: 'Estimativa simples', premium: 'Matriz completa de menores milheiros' },
    { label: 'Filtro de Vagas Escassas', free: 'Não disponível', premium: 'Aviso imediato de assentos de oportunidade' },
    { label: 'Suporte & Curadoria Especializada', free: 'Comunidade', premium: 'Atendimento prioritário VIP' }
  ];

  const faqs = [
    {
      q: 'Como o FlySync Premium se paga logo na primeira viagem?',
      a: 'Uma passagem em Classe Executiva para os EUA ou Europa custa em média de R$ 9.000 a R$ 18.000 no dinheiro. Com os alertas em tempo real do FlySync, você consegue emitir a mesma vaga por 42.500 a 75.000 milhas (equivalente a ~R$ 1.200 a R$ 2.400). A economia de uma única emissão paga anos de assinatura.'
    },
    {
      q: 'Por que o alerta no WhatsApp faz tanta diferença?',
      a: 'As companhias aéreas disponibilizam pouquíssimos assentos (geralmente entre 2 e 4 vagas) nas tarifas promocionais piso. Quem recebe o alerta no WhatsApp emite antes que os assentos esgotem em fóruns públicos.'
    },
    {
      q: 'Posso cancelar quando quiser?',
      a: 'Sim, o cancelamento é feito com 1 clique direto no painel, sem burocracia, taxas ocultas ou necessidade de falar com atendente.'
    },
    {
      q: 'Existe garantia se eu não gostar?',
      a: 'Oferecemos garantia incondicional de 7 dias com risco zero. Se você não achar tarifas excelentes para suas viagens, devolvemos 100% do valor pago imediatamente.'
    }
  ];

  const formatDate = (isoStr: string) => {
    try {
      return new Date(isoStr).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return isoStr;
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-200 text-white pb-16">
      
      {/* HERO SECTION ELEVADA: Amex Centurion meets Bloomberg */}
      <div className="text-center max-w-3xl mx-auto pt-2 pb-2 px-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-emerald-500/15 via-purple-900/40 to-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-black tracking-wide uppercase mb-4 shadow-[0_0_20px_rgba(34,197,94,0.15)]">
          <Crown className="w-4 h-4 text-[#22C55E]" />
          <span>Acesso Privado ao Radar de Tarifas Piso</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
          Viaje de Executiva pagando preço de <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#4ADE80] via-[#22C55E] to-[#38BDF8]">econômica</span>.
        </h1>
        
        <p className="text-sm sm:text-base text-slate-300 mt-3.5 max-w-2xl mx-auto leading-relaxed">
          Monitoramento automatizado 24 horas por dia em todas as companhias aéreas. Receba no WhatsApp os alertas de vagas secretas antes que acabem.
        </p>

        {/* Prova Social Rápida */}
        <div className="mt-5 flex items-center justify-center gap-3 sm:gap-6 flex-wrap text-xs text-slate-300">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-[#22C55E]" />
            <span><strong>+4.850</strong> viajantes ativos</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Flame className="w-4 h-4 text-amber-400" />
            <span><strong>R$ 2.480</strong> economia média/ano</span>
          </div>
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            <span>Garantia de 7 dias sem risco</span>
          </div>
        </div>

        {/* INTERVAL SELECTOR ELEGANTE */}
        <div className="mt-8 inline-flex items-center p-1.5 bg-[#14052C] rounded-2xl border border-purple-800/80 shadow-xl">
          <button
            type="button"
            onClick={() => setBillingInterval('month')}
            className={`px-5 py-2 text-xs font-black rounded-xl transition-all cursor-pointer ${
              billingInterval === 'month'
                ? 'bg-purple-800 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Cobrança Mensal
          </button>
          <button
            type="button"
            onClick={() => setBillingInterval('year')}
            className={`px-5 py-2 text-xs font-black rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
              billingInterval === 'year'
                ? 'bg-gradient-to-r from-[#4ADE80] to-[#22C55E] text-slate-950 shadow-[0_0_20px_rgba(34,197,94,0.35)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>Plano Anual</span>
            <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
              billingInterval === 'year'
                ? 'bg-slate-950 text-emerald-400'
                : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
            }`}>
              2 Meses Grátis (-22%)
            </span>
          </button>
        </div>
      </div>

      {/* PAINEL DE ASSINANTE ATIVO (SE FOR PREMIUM) */}
      {isPremium && (
        <div className="p-6 rounded-2xl bg-gradient-to-br from-[#1C093E] via-[#13062C] to-[#0A021B] text-white border border-emerald-500/50 shadow-[0_0_35px_rgba(34,197,94,0.2)] max-w-4xl mx-auto relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-purple-900/60 relative z-10">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2.5 h-2.5 rounded-full bg-[#22C55E] animate-pulse" />
                <span className="text-xs uppercase font-black tracking-wider text-emerald-400">
                  Status da Conta VIP
                </span>
              </div>
              <h3 className="text-xl font-black text-white flex items-center gap-2">
                <span>FlySync Premium Ativo</span>
                <Crown className="w-5 h-5 text-amber-400" />
              </h3>
            </div>

            <div className="sm:text-right">
              <span className="text-xs text-purple-300 block">Frequência:</span>
              <span className="text-sm font-bold text-emerald-400">
                Ativa · Cobrança {subscription?.billingInterval === 'year' ? 'Anual' : 'Mensal'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 text-xs text-purple-200 relative z-10">
            <div>
              <span className="text-purple-400 block font-medium">Próxima Renovação:</span>
              <strong className="text-white text-sm font-mono tabular-nums">
                {subscription ? formatDate(subscription.currentPeriodEnd) : 'Em 30 dias'}
              </strong>
            </div>

            <div>
              <span className="text-purple-400 block font-medium">Forma de Pagamento:</span>
              <strong className="text-white text-sm capitalize">
                {subscription?.provider === 'pix' ? 'PIX Instantâneo' : 'Cartão de Crédito'}
              </strong>
            </div>

            <div className="sm:text-right flex items-center sm:justify-end">
              {confirmCancel ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-rose-300">Confirmar?</span>
                  <button
                    onClick={() => {
                      cancelSubscription();
                      setConfirmCancel(false);
                    }}
                    className="px-3 py-1 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-lg"
                  >
                    Sim, Cancelar
                  </button>
                  <button
                    onClick={() => setConfirmCancel(false)}
                    className="px-2 py-1 text-xs text-purple-300 hover:text-white"
                  >
                    Voltar
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmCancel(true)}
                  className="text-xs text-purple-300 hover:text-rose-400 underline transition-colors"
                >
                  Gerenciar ou cancelar
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* CARDS DE PREÇO: GRÁTIS VS PREMIUM COM DESIGN REFINADO */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto px-4 items-stretch">
        
        {/* FREE PLAN */}
        <div className={`p-6 sm:p-7 rounded-3xl bg-[#120526]/90 border flex flex-col justify-between backdrop-blur-sm ${
          !isPremium ? 'border-purple-800 shadow-lg' : 'border-purple-900/50'
        }`}>
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-bold text-slate-300">Plano Gratuito</h3>
              {!isPremium && (
                <span className="text-[11px] font-bold bg-purple-900/60 text-purple-300 px-2.5 py-0.5 rounded-full border border-purple-700/60">
                  Plano Atual
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mb-6 leading-relaxed">
              Recursos essenciais para organizar sua carteira de milhas e fazer buscas manuais.
            </p>

            <div className="pb-5 mb-5 border-b border-purple-900/60">
              <span className="text-4xl font-black text-white font-mono tabular-nums">
                R$ 0
              </span>
              <span className="text-xs text-slate-400 ml-1">/para sempre</span>
            </div>

            <ul className="space-y-3 text-xs text-slate-300">
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                <span>Gestão manual de até 8 programas de milhas</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                <span>Consolidação de saldo e alerta de vencimento</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                <span>Acesso ao Radar de Ofertas (apenas Econômica)</span>
              </li>
              <li className="flex items-start gap-2.5 text-slate-500">
                <span className="w-4 h-4 text-slate-600 shrink-0 mt-0.5 font-bold">✕</span>
                <span className="line-through">Sem alertas imediatos no WhatsApp</span>
              </li>
              <li className="flex items-start gap-2.5 text-slate-500">
                <span className="w-4 h-4 text-slate-600 shrink-0 mt-0.5 font-bold">✕</span>
                <span className="line-through">Sem Classe Executiva & Primeira Classe</span>
              </li>
            </ul>
          </div>

          <div className="pt-6 mt-6 border-t border-purple-900/60">
            <button
              disabled={!isPremium}
              className={`w-full py-3 text-xs font-bold rounded-xl transition-colors ${
                !isPremium
                  ? 'bg-purple-950/60 text-purple-400 cursor-default border border-purple-900/60'
                  : 'bg-[#180A38] border border-purple-700 hover:bg-purple-900 text-white'
              }`}
            >
              {!isPremium ? 'Seu Plano Básico' : 'Retornar ao Free'}
            </button>
          </div>
        </div>

        {/* FLYSYNC PREMIUM: THE HIGH CONVERTING FLAGSHIP */}
        <div className={`p-6 sm:p-7 rounded-3xl bg-gradient-to-b from-[#220B4A] via-[#160633] to-[#0D031F] border-2 flex flex-col justify-between relative shadow-[0_0_50px_rgba(34,197,94,0.18)] ${
          isPremium
            ? 'border-emerald-500 ring-2 ring-emerald-500/30'
            : 'border-emerald-400/80 hover:border-emerald-300 transition-all'
        }`}>
          {/* Badge de Destaque no Topo */}
          <div className="absolute -top-3.5 right-6 bg-gradient-to-r from-[#4ADE80] to-[#22C55E] text-slate-950 text-[11px] font-black uppercase tracking-wider px-3.5 py-1 rounded-full shadow-[0_0_15px_rgba(34,197,94,0.6)] flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 fill-slate-950" />
            <span>Escolha dos Viajantes</span>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xl font-black text-white flex items-center gap-2">
                <span>FlySync Premium</span>
                <Crown className="w-4 h-4 text-amber-400" />
              </h3>
              {isPremium && (
                <span className="text-[11px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 px-2.5 py-0.5 rounded-full">
                  Ativo
                </span>
              )}
            </div>

            <p className="text-xs text-purple-200/90 mb-6 leading-relaxed">
              O radar completo com alertas automáticos em tempo real para emitir passagens de alto valor pelo menor custo.
            </p>

            {/* PREÇO COM CALCULO DIÁRIO */}
            <div className="pb-5 mb-5 border-b border-purple-800/80">
              <div className="flex items-baseline gap-1.5">
                <span className="text-xs text-slate-300 font-bold">R$</span>
                <span className="text-4xl sm:text-5xl font-black text-white font-mono tabular-nums tracking-tight">
                  {billingInterval === 'year'
                    ? (PLANS.premium.priceAnnual / 12).toFixed(2).replace('.', ',')
                    : PLANS.premium.priceMonthly.toFixed(2).replace('.', ',')}
                </span>
                <span className="text-xs text-purple-300 font-semibold">/mês</span>
              </div>

              <div className="mt-1 flex items-center gap-2 flex-wrap">
                <span className="text-[11px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                  {billingInterval === 'year' ? 'Apenas R$ 0,76 por dia' : 'Cobrança mensal sem fidelidade'}
                </span>
                {billingInterval === 'year' && (
                  <span className="text-[11px] text-slate-400">
                    (R$ {PLANS.premium.priceAnnual.toFixed(2).replace('.', ',')} ao ano)
                  </span>
                )}
              </div>
            </div>

            {/* RECURSOS VIP PREMIUM */}
            <ul className="space-y-3 text-xs text-white font-medium">
              <li className="flex items-start gap-2.5">
                <div className="w-4 h-4 rounded-full bg-emerald-500/20 text-[#22C55E] flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
                <span>
                  <strong className="text-emerald-400">Alertas Instantâneos no WhatsApp:</strong> Notificação em menos de 60 segundos após a tarifa baixar.
                </span>
              </li>

              <li className="flex items-start gap-2.5">
                <div className="w-4 h-4 rounded-full bg-emerald-500/20 text-[#22C55E] flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
                <span>
                  <strong className="text-cyan-300">Classe Executiva & Primeira Classe:</strong> Filtro de tarifas floor e emissões de luxo.
                </span>
              </li>

              <li className="flex items-start gap-2.5">
                <div className="w-4 h-4 rounded-full bg-emerald-500/20 text-[#22C55E] flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
                <span>
                  <strong className="text-white">Até 15 rotas monitoradas 24/7</strong> com verificação contínua de assentos restantes.
                </span>
              </li>

              <li className="flex items-start gap-2.5">
                <div className="w-4 h-4 rounded-full bg-emerald-500/20 text-[#22C55E] flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
                <span>
                  <strong className="text-white">Termômetro & Análise Preditiva:</strong> Saiba na hora se o preço está no piso histórico ou se deve esperar.
                </span>
              </li>

              <li className="flex items-start gap-2.5">
                <div className="w-4 h-4 rounded-full bg-emerald-500/20 text-[#22C55E] flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
                <span>
                  <strong className="text-white">Multi-Programa Integrado:</strong> Smiles, LATAM, Azul, TAP Miles&Go, Iberia e Livelo.
                </span>
              </li>
            </ul>
          </div>

          {/* BOTÃO DE AÇÃO COM MÁXIMO CONVENCIMENTO */}
          <div className="pt-6 mt-6 border-t border-purple-800/80 space-y-2">
            <button
              type="button"
              onClick={() => setIsCheckoutOpen(true)}
              disabled={isPremium}
              className={`w-full py-3.5 text-xs font-black rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer transform hover:scale-[1.02] active:scale-[0.98] ${
                isPremium
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 cursor-default'
                  : 'bg-gradient-to-r from-[#4ADE80] to-[#22C55E] hover:from-[#22C55E] hover:to-[#16A34A] text-slate-950 shadow-[0_0_25px_rgba(34,197,94,0.45)]'
              }`}
            >
              <Zap className="w-4 h-4 fill-slate-950" />
              <span>{isPremium ? 'Você já é Membro VIP Ativo' : 'Desbloquear FlySync Premium Agora'}</span>
              {!isPremium && <ArrowRight className="w-4 h-4 stroke-[3]" />}
            </button>

            <div className="flex items-center justify-center gap-2 text-[10px] text-slate-400 text-center">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Garantia de 7 dias · Cancele com 1 clique · PIX e Cartão</span>
            </div>
          </div>
        </div>
      </div>

      {/* CASO REAL DE ECONOMIA: POR QUE VALE A PENA */}
      <div className="max-w-4xl mx-auto px-4">
        <div className="p-6 sm:p-7 rounded-3xl bg-gradient-to-r from-[#170533] via-[#100326] to-[#0A0218] border border-purple-800/80 shadow-xl space-y-4">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-amber-400">
            <Flame className="w-4 h-4 fill-current" />
            <span>Exemplo Real de Emissão Monitorada</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            <div className="space-y-1">
              <span className="text-xs text-slate-400 font-medium">Rota Monitorada:</span>
              <h4 className="text-lg font-black text-white">Rio de Janeiro ➔ Madri</h4>
              <span className="text-xs text-purple-300 font-semibold">Classe Executiva (Iberia)</span>
            </div>

            <div className="p-3.5 rounded-xl bg-purple-950/40 border border-purple-800/40 space-y-1">
              <span className="text-[11px] text-slate-400">Tarifa Pagante no Balcão:</span>
              <div className="text-xl font-black text-rose-400 font-mono">R$ 13.800</div>
              <span className="text-[10px] text-slate-500">preço médio em dinheiro</span>
            </div>

            <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 space-y-1">
              <span className="text-[11px] text-emerald-300 font-bold">Emitido com Alerta FlySync:</span>
              <div className="text-xl font-black text-emerald-400 font-mono">42.500 Avios (~R$ 3.400)</div>
              <span className="text-[10px] text-emerald-400/90 font-bold">
                Você economiza R$ 10.400 nesta emissão!
              </span>
            </div>
          </div>

          <p className="text-xs text-slate-300 pt-2 border-t border-purple-900/60 leading-relaxed">
            Uma única passagem emitida com tarifa piso economiza o equivalente a mais de <strong>30 anos de assinatura</strong> do FlySync.
          </p>
        </div>
      </div>

      {/* TABELA COMPARATIVA DETALHADA */}
      <div className="max-w-4xl mx-auto px-4">
        <div className="p-6 sm:p-7 rounded-3xl bg-[#120526] border border-purple-800/80 shadow-xl space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base sm:text-lg font-black text-white">
                Comparativo Detalhado de Recursos
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Veja tudo o que você desbloqueia ao se tornar assinante Premium
              </p>
            </div>
            <Award className="w-5 h-5 text-emerald-400" />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-purple-900/60 text-purple-300 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3 pr-4">Funcionalidade</th>
                  <th className="py-3 px-4 text-slate-400">Plano Free</th>
                  <th className="py-3 pl-4 text-emerald-400 font-black">FlySync Premium</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-purple-900/40">
                {comparisonFeatures.map((row, idx) => (
                  <tr key={idx} className="hover:bg-purple-900/20 transition-colors">
                    <td className="py-3 pr-4 font-semibold text-slate-200">{row.label}</td>
                    <td className="py-3 px-4 text-slate-400">{row.free}</td>
                    <td className="py-3 pl-4 text-emerald-300 font-black flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-[#22C55E]" />
                      <span>{row.premium}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* PERGUNTAS FREQUENTES (FAQ) DE OBJEÇÕES */}
      <div className="max-w-4xl mx-auto px-4 space-y-4">
        <div className="text-center pb-2">
          <h3 className="text-xl font-black text-white">Dúvidas Frequentes</h3>
          <p className="text-xs text-slate-400 mt-1">Transparência total antes de você tomar sua decisão</p>
        </div>

        <div className="space-y-2.5">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl border border-purple-900/60 bg-[#120526] overflow-hidden transition-all"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full p-4 sm:p-4.5 text-left text-xs font-bold text-white flex items-center justify-between gap-3 cursor-pointer hover:bg-purple-900/20"
                >
                  <span className="flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-purple-400 shrink-0" />
                    <span>{faq.q}</span>
                  </span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 sm:px-4.5 sm:pb-4.5 text-xs text-slate-300 leading-relaxed border-t border-purple-900/40 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* AUDITORIA DE PAGAMENTOS REGISTRADOS */}
      {paymentEvents.length > 0 && (
        <div className="max-w-4xl mx-auto px-4">
          <div className="p-4 rounded-2xl bg-[#120526]/80 border border-purple-900/60 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-purple-300">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Eventos de Pagamento Registrados (Auditoria do Gateway):</span>
            </div>
            <div className="space-y-1.5 text-[11px] font-mono text-purple-200">
              {paymentEvents.map((evt) => (
                <div key={evt.id} className="flex items-center justify-between py-1 border-b border-purple-900/40">
                  <span>{evt.providerEventId} · {evt.method}</span>
                  <span className="font-bold text-emerald-400">R$ {evt.amount.toFixed(2)} (Status: {evt.status})</span>
                  <span className="text-slate-400">{formatDate(evt.processedAt)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* CHECKOUT MODAL */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        interval={billingInterval}
      />
    </div>
  );
};

import React, { useState, useMemo } from 'react';
import { useFlySync } from '../../store/FlySyncContext';
import {
  Lightbulb,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  Zap,
  Repeat,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Compass,
  Plane,
  ChevronDown,
  ChevronUp,
  Sliders,
  Award,
  ExternalLink
} from 'lucide-react';

export type TipCategory = 'all' | 'bonus_transfer' | 'expiration' | 'sweet_spot' | 'card_strategy';

export interface ExpertTipItem {
  id: string;
  category: TipCategory;
  priority: 'urgent' | 'high' | 'medium' | 'growth';
  title: string;
  badge: string;
  badgeColor: string;
  summary: string;
  detailedAnalysis: string;
  potentialGainLabel: string;
  potentialMiles: number;
  actionLabel?: string;
  actionType?: 'campaigns' | 'radar' | 'calculator' | 'transfer_simulator';
  actionTarget?: string;
  isApplied?: boolean;
}

export const ExpertTips: React.FC = () => {
  const { balances, programs, campaigns, getConsolidatedTotals } = useFlySync();

  const [activeCategory, setActiveCategory] = useState<TipCategory>('all');
  const [expandedTipId, setExpandedTipId] = useState<string | null>('tip-bonus-livelo');
  const [completedTipIds, setCompletedTipIds] = useState<Set<string>>(new Set());

  // Interactive Transfer Simulator State
  const [simPoints, setSimPoints] = useState<number>(100000);
  const [simBonusPercent, setSimBonusPercent] = useState<number>(80);
  const [simSelectedProgram, setSimSelectedProgram] = useState<string>('Smiles');

  const totals = getConsolidatedTotals();
  const totalCombined = totals.airlineMiles + totals.bankPoints + totals.avios;

  // Find user-specific metrics for tailored tips
  const liveloBal = balances.find(b => b.programId === 'prog-livelo')?.balance || 0;
  const esferaBal = balances.find(b => b.programId === 'prog-esfera')?.balance || 0;
  const totalBankPoints = liveloBal + esferaBal;

  const azulBal = balances.find(b => b.programId === 'prog-azul');
  const smilesBal = balances.find(b => b.programId === 'prog-smiles')?.balance || 0;
  const latamBal = balances.find(b => b.programId === 'prog-latampass')?.balance || 0;
  const iberiaBal = balances.find(b => b.programId === 'prog-iberia')?.balance || 0;

  // Check for expiring balances in next 30 days
  const expiringSoonBalances = useMemo(() => {
    const now = new Date().getTime();
    return balances.filter(b => {
      if (!b.expiresAt) return false;
      const exp = new Date(b.expiresAt).getTime();
      const diffDays = Math.ceil((exp - now) / (1000 * 60 * 60 * 24));
      return diffDays > 0 && diffDays <= 45;
    });
  }, [balances]);

  // Generate dynamic, data-driven tips based on the user's portfolio
  const tips: ExpertTipItem[] = useMemo(() => {
    const generated: ExpertTipItem[] = [];

    // 1. Expiring balance warning & action (Urgent)
    if (expiringSoonBalances.length > 0) {
      const targetBal = expiringSoonBalances[0];
      const prog = programs.find(p => p.id === targetBal.programId);
      const daysLeft = Math.ceil((new Date(targetBal.expiresAt!).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

      generated.push({
        id: 'tip-expiration-rescue',
        category: 'expiration',
        priority: 'urgent',
        title: `Resgate de Emergência: ${targetBal.balance.toLocaleString('pt-BR')} ${prog?.unitLabel || 'pontos'} em risco`,
        badge: `Vence em ${daysLeft} dias`,
        badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
        summary: `Seu saldo no programa ${prog?.name} expira em breve. Evite queimar pontos em produtos de baixo valor no shopping.`,
        detailedAnalysis: `Pontos aéreos prestes a vencer perdem 100% do valor se expirarem. Recomendação do especialista:
1. Emita uma passagem com antecedência de até 330 dias (mesmo para datas futuras).
2. Se não for viajar, transfira para programas parceiros ou utilize a ferramenta de compra turbinada de validade se o custo do milheiro for inferior a R$ 15.
3. Se a quantidade for suficiente (${targetBal.balance.toLocaleString('pt-BR')} pontos), resgate passagens curtas nacionais (ponte aérea ou destinos de fim de semana).`,
        potentialGainLabel: 'Preservação de Saldo',
        potentialMiles: targetBal.balance,
        actionLabel: 'Ver Voos no Radar',
        actionType: 'radar'
      });
    }

    // 2. High Bank Points Arbitrage (Transferência Bonificada)
    if (totalBankPoints > 20000) {
      const bonusPotential80 = Math.round(totalBankPoints * 0.8);
      generated.push({
        id: 'tip-bonus-livelo',
        category: 'bonus_transfer',
        priority: 'high',
        title: `Multiplicação Bonificada: +${bonusPotential80.toLocaleString('pt-BR')} milhas gratuitas`,
        badge: 'Arbitragem de Pontos',
        badgeColor: 'bg-[#22C55E]/20 text-[#22C55E] border-emerald-500/40',
        summary: `Você possui ${totalBankPoints.toLocaleString('pt-BR')} pontos bancários (Livelo/Esfera). Nunca transfira com taxa 1:1 sem promoção.`,
        detailedAnalysis: `Pontos bancários são a sua moeda mais valiosa porque são neutros e não sofrem inflação rápida de programas aéreos.
Ao aguardar uma campanha promocional com bonificação entre 70% e 100% para Smiles, LATAM Pass ou Azul:
• Seus ${totalBankPoints.toLocaleString('pt-BR')} pontos se transformam em ${(totalBankPoints + bonusPotential80).toLocaleString('pt-BR')} milhas.
• Você ganha +${bonusPotential80.toLocaleString('pt-BR')} milhas sem desembolsar um único centavo adicional.
• Dica de ouro: Mantenha seus pontos em bancos até o momento exato em que encontrar a vaga desejada no radar de emissão.`,
        potentialGainLabel: 'Ganho Bônus Estimado',
        potentialMiles: bonusPotential80,
        actionLabel: 'Simular Transferência',
        actionType: 'transfer_simulator'
      });
    }

    // 3. Iberia Plus Sweet Spot (Executive Europe)
    if (iberiaBal >= 30000) {
      const neededForExec = 42500;
      const diff = neededForExec - iberiaBal;
      const canFlyExec = diff <= 0;

      generated.push({
        id: 'tip-iberia-sweetspot',
        category: 'sweet_spot',
        priority: 'high',
        title: canFlyExec
          ? `Sweet Spot Ativo: Executiva São Paulo ➔ Madri com Avios`
          : `Quase lá: Faltam apenas ${diff.toLocaleString('pt-BR')} Avios para Classe Executiva`,
        badge: 'Sweet Spot Internacional',
        badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
        summary: `Você possui ${iberiaBal.toLocaleString('pt-BR')} Avios no Iberia Plus. Esta é uma das emissões mais eficientes do mercado mundial.`,
        detailedAnalysis: `A rota GRU - MAD ou GIG - MAD operada pela Iberia em período de baixa temporada (off-peak) custa a partir de apenas 42.500 Avios em Classe Executiva (com poltrona lie-flat e refeições completas).
• Comparativo: Em dinheiro, esse bilhete custa comumente entre R$ 12.000 e R$ 18.000.
• Com ${iberiaBal.toLocaleString('pt-BR')} Avios acumulados, o valor extraído por cada 1.000 Avios ultrapassa R$ 85,00!
• Como completar o saldo restante: Transfira a paridade 2:1 da Esfera ou Livelo durante campanhas com desconto.`,
        potentialGainLabel: 'Valor de Executiva',
        potentialMiles: 42500,
        actionLabel: 'Ver Ofertas no Radar',
        actionType: 'radar'
      });
    }

    // 4. LATAM Pass Sweet Spot & International Alliances
    if (latamBal >= 70000) {
      generated.push({
        id: 'tip-latam-pass',
        category: 'sweet_spot',
        priority: 'growth',
        title: `Emissão Estratégica LATAM: Voos Diretos para EUA e África do Sul`,
        badge: 'Emissão de Alto Valor',
        badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
        summary: `Com ${latamBal.toLocaleString('pt-BR')} milhas LATAM Pass, você está na faixa de resgate para voos diretos de longa distância.`,
        detailedAnalysis: `O programa LATAM Pass possui trechos de ida e volta para Miami (MIA) e Orlando (MCO) na faixa de 60.000 a 85.000 milhas em cabine econômica, ou Johannesburgo (JNB) a partir de 75.000 milhas.
• Dica de especialista: Emita em datas na baixa temporada (março a maio, agosto a outubro) para tarifas base promocionais.
• Emita com até 6 a 9 meses de antecedência para garantir as menores taxas de milhas.`,
        potentialGainLabel: 'Trecho Internacional',
        potentialMiles: 75000,
        actionLabel: 'Calcular Milhas do Voo',
        actionType: 'calculator'
      });
    }

    // 5. Portfólio Balance & Concentração (Estratégia de Cartão e Clube)
    const bankRatio = totalCombined > 0 ? (totals.bankPoints / totalCombined) * 100 : 0;
    generated.push({
      id: 'tip-portfolio-balance',
      category: 'card_strategy',
      priority: 'growth',
      title: 'Regra de Ouro: Proporção 60/40 entre Bancos e Companhias',
      badge: 'Gestão de Risco',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      summary: `Atualmente seu portfólio tem ${Math.round(bankRatio)}% em pontos bancários e ${Math.round(100 - bankRatio)}% em programas de companhias aéreas.`,
      detailedAnalysis: `Especialistas em fidelidade recomendam manter entre 50% e 70% do saldo total concentrado em pontos de bancos flexíveis (Livelo, Esfera, C6 Átomos) e apenas o estritamente necessário nas companhias aéreas.
• Por que não acumular tudo na companhia aérea? Milhas aéreas expiram mais rápido e sofrem inflação de tabela sem aviso prévio.
• Ao concentrar os gastos do dia a dia no cartão com pontos bancários, você tem o poder de escolher a companhia (Smiles, Latam, Azul ou TAP) somente quando a oportunidade de voo aparecer.`,
      potentialGainLabel: 'Flexibilidade de Resgate',
      potentialMiles: 50000,
      actionLabel: 'Ver Campanhas de Acúmulo',
      actionType: 'campaigns'
    });

    // 6. Compras Bonificadas no Varejo (10x por Real)
    generated.push({
      id: 'tip-retail-multipliers',
      category: 'card_strategy',
      priority: 'growth',
      title: 'Aceleração Turbinada: 10 Pontos por Real em Compras Planejadas',
      badge: 'Alavancagem 10x',
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      summary: 'Nunca compre eletrônicos, farmácia ou viagens sem antes verificar as parcerias de 8x a 12x pontos por real.',
      detailedAnalysis: `A forma mais veloz de acumular 100.000 milhas não é pelo cartão de crédito comum, mas através de compras bonificadas com parceiros varejistas:
• Exemplo prático: Uma compra de celular ou eletrodoméstico de R$ 3.000 em promoção 10:1 gera 30.000 pontos Livelo.
• Transferidos com bônus de 80%, esses 30.000 viram 54.000 milhas aéreas!
• Isso equivale a uma passagem ida e volta de férias conquistada apenas direcionando uma despesa que você já faria.`,
      potentialGainLabel: 'Potencial de Aceleração',
      potentialMiles: 54000,
      actionLabel: 'Ver Campanhas Ativas',
      actionType: 'campaigns'
    });

    return generated;
  }, [balances, programs, totals, expiringSoonBalances, totalBankPoints, iberiaBal, latamBal, totalCombined]);

  const filteredTips = useMemo(() => {
    if (activeCategory === 'all') return tips;
    return tips.filter(t => t.category === activeCategory);
  }, [tips, activeCategory]);

  const toggleCompleted = (tipId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCompletedTipIds(prev => {
      const next = new Set(prev);
      if (next.has(tipId)) next.delete(tipId);
      else next.add(tipId);
      return next;
    });
  };

  // Transfer simulation calculations
  const simBonusMiles = Math.round(simPoints * (simBonusPercent / 100));
  const simTotalResult = simPoints + simBonusMiles;
  const simEstimatedMoneyGain = (simBonusMiles / 1000) * 17.5; // Média R$ 17,50 por milheiro

  // Total potential miles unlocked by applying all tips
  const totalPotentialGains = tips.reduce((sum, t) => sum + (completedTipIds.has(t.id) ? 0 : t.potentialMiles), 0);

  const handleActionClick = (actionType?: string) => {
    if (!actionType) return;
    if (actionType === 'radar') {
      window.location.hash = '#radar';
      const el = document.getElementById('radar-offers-container') || document.querySelector('header');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    } else if (actionType === 'calculator') {
      const el = document.getElementById('miles-calculator');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    } else if (actionType === 'campaigns') {
      window.location.hash = '#campaigns';
    } else if (actionType === 'transfer_simulator') {
      const el = document.getElementById('transfer-bonus-simulator');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div id="expert-tips" className="p-6 rounded-2xl bg-[#13062C] border border-purple-900/60 shadow-xl space-y-6 relative overflow-hidden">
      {/* Decorative ambient gradient backdrop matching brand logo */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-emerald-500/10 via-cyan-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header section with brand identity styling */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-purple-900/40 relative z-10">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 mb-1.5">
            <span className="p-1 rounded-md bg-[#22C55E]/15 border border-[#22C55E]/30 text-[#22C55E]">
              <Lightbulb className="w-3.5 h-3.5" />
            </span>
            <span className="tracking-wide uppercase text-[11px] font-bold text-slate-300">
              Inteligência de Fidelidade FlySync
            </span>
            <span aria-hidden="true" className="text-purple-400">·</span>
            <span className="text-cyan-300">Baseado no seu Saldo Real</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <span>Dicas de Especialista para Otimizar Milhas</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-[#22C55E]/15 text-[#22C55E] border border-[#22C55E]/30 hidden sm:inline-block">
              {tips.length} Recomendações
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-3xl leading-relaxed">
            Sugestões para aproveitar melhor seus pontos, com base nos seus saldos e prazos de validade.
          </p>
        </div>

        {/* Highlight metric card: Potencial de Ganho */}
        <div className="shrink-0 p-3.5 rounded-xl bg-gradient-to-r from-[#180838] to-[#1F0A44] border border-purple-800/80 shadow-md flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-[#22C55E]/15 border border-[#22C55E]/30 flex items-center justify-center text-[#22C55E] shrink-0">
            <Zap className="w-5 h-5 fill-[#22C55E]/20" />
          </div>
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Potencial Destravável
            </div>
            <div className="text-lg font-black font-mono text-white flex items-baseline gap-1">
              <span className="text-[#22C55E]">+{totalPotentialGains.toLocaleString('pt-BR')}</span>
              <span className="text-xs text-slate-400 font-sans font-normal">milhas</span>
            </div>
            <div className="text-[10px] text-cyan-300 font-medium">
              Economia estimada de ~R$ {Math.round((totalPotentialGains / 1000) * 17.5).toLocaleString('pt-BR')}
            </div>
          </div>
        </div>
      </div>

      {/* Category filter pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none relative z-10 text-xs">
        <span className="text-slate-400 text-xs font-semibold mr-1 shrink-0 flex items-center gap-1">
          <Sliders className="w-3.5 h-3.5 text-purple-400" />
          Filtros:
        </span>
        {[
          { key: 'all', label: 'Todas as Dicas' },
          { key: 'bonus_transfer', label: 'Transferências Bonificadas' },
          { key: 'expiration', label: 'Alerta de Vencimento' },
          { key: 'sweet_spot', label: 'Sweet Spots de Resgate' },
          { key: 'card_strategy', label: 'Estratégia de Acúmulo' }
        ].map(cat => {
          const isActive = activeCategory === cat.key;
          return (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(cat.key as TipCategory)}
              className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-[#22C55E] text-slate-950 font-bold shadow-[0_0_12px_rgba(34,197,94,0.35)]'
                  : 'bg-[#180838] text-slate-300 hover:text-white hover:bg-purple-900/40 border border-purple-800/40'
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* List of Tips */}
      <div className="space-y-3 relative z-10">
        {filteredTips.length === 0 ? (
          <div className="p-8 text-center rounded-xl bg-[#180838]/60 border border-purple-900/40 text-slate-400 text-xs">
            Nenhuma dica encontrada nesta categoria para o seu perfil atual.
          </div>
        ) : (
          filteredTips.map(tip => {
            const isExpanded = expandedTipId === tip.id;
            const isCompleted = completedTipIds.has(tip.id);

            return (
              <div
                key={tip.id}
                className={`rounded-xl border transition-all overflow-hidden ${
                  isCompleted
                    ? 'bg-[#160833]/40 border-purple-900/30 opacity-70'
                    : isExpanded
                    ? 'bg-[#180838] border-purple-700 shadow-lg ring-1 ring-purple-600/30'
                    : 'bg-[#150731] border-purple-900/60 hover:border-purple-700/80'
                }`}
              >
                {/* Header Row */}
                <div
                  onClick={() => setExpandedTipId(isExpanded ? null : tip.id)}
                  className="p-4 sm:p-5 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 select-none"
                >
                  <div className="flex items-start gap-3.5 flex-1">
                    {/* Completion Checkbox */}
                    <button
                      onClick={(e) => toggleCompleted(tip.id, e)}
                      title={isCompleted ? 'Desmarcar' : 'Marcar como aplicada'}
                      className={`mt-0.5 w-6 h-6 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                        isCompleted
                          ? 'bg-[#22C55E] text-slate-950 font-bold'
                          : 'border border-purple-700 text-transparent hover:border-[#22C55E] hover:text-[#22C55E]'
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </button>

                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${tip.badgeColor}`}>
                          {tip.badge}
                        </span>
                        {tip.priority === 'urgent' && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            Ação Imediata
                          </span>
                        )}
                        <span className="text-[10px] text-slate-400 font-mono">
                          {tip.potentialGainLabel}: <strong className="text-white">+{tip.potentialMiles.toLocaleString('pt-BR')} milhas</strong>
                        </span>
                      </div>

                      <h3 className={`text-sm sm:text-base font-bold text-white tracking-tight ${isCompleted ? 'line-through text-slate-400' : ''}`}>
                        {tip.title}
                      </h3>
                      <p className="text-xs text-slate-300 line-clamp-1 sm:line-clamp-none">
                        {tip.summary}
                      </p>
                    </div>
                  </div>

                  {/* Actions & Chevron */}
                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    <span className="text-xs font-semibold text-purple-300 flex items-center gap-1">
                      {isExpanded ? 'Ocultar detalhes' : 'Ver estratégia'}
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </span>
                  </div>
                </div>

                {/* Expanded Details Section */}
                {isExpanded && (
                  <div className="px-5 pb-5 pt-2 border-t border-purple-900/50 bg-[#120526]/60 space-y-4 text-xs animate-in fade-in duration-150">
                    <div className="p-4 rounded-xl bg-[#160833] border border-purple-900/70 text-slate-300 leading-relaxed whitespace-pre-line font-sans">
                      {tip.detailedAnalysis}
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                      <div className="flex items-center gap-2 text-slate-400 text-xs">
                        <ShieldCheck className="w-4 h-4 text-[#22C55E]" />
                        <span>Baseado nas regras atuais das companhias</span>
                      </div>

                      <div className="flex items-center gap-2">
                        {tip.actionLabel && (
                          <button
                            onClick={() => handleActionClick(tip.actionType)}
                            className="px-3.5 py-1.5 rounded-lg text-xs font-bold text-slate-950 bg-[#22C55E] hover:bg-emerald-400 transition-colors flex items-center gap-1.5 shadow-[0_0_12px_rgba(34,197,94,0.3)]"
                          >
                            <span>{tip.actionLabel}</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          onClick={(e) => toggleCompleted(tip.id, e)}
                          className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white bg-purple-900/30 hover:bg-purple-900/50 border border-purple-800/60 transition-colors"
                        >
                          {isCompleted ? 'Reabrir Dica' : 'Marcar como Aplicada'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Interactive Transfer Bonus Simulator */}
      <div id="transfer-bonus-simulator" className="p-5 sm:p-6 rounded-xl bg-gradient-to-br from-[#160833] to-[#120526] border border-purple-800/80 shadow-lg space-y-4 relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-purple-900/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-[#38BDF8]/15 border border-[#38BDF8]/30 text-[#38BDF8]">
              <Repeat className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">
                Simulador Interativo de Transferência Bonificada
              </h3>
              <p className="text-[11px] text-slate-400">
                Calcule em tempo real o salto do seu saldo bancário ao aguardar a promoção certa
              </p>
            </div>
          </div>

          <span className="text-[11px] font-mono text-[#22C55E] bg-[#22C55E]/10 border border-[#22C55E]/20 px-2.5 py-1 rounded-md self-start sm:self-auto font-semibold">
            Bônus Selecionado: {simBonusPercent}%
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
          {/* Input: Pontos a transferir */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-slate-300 flex items-center justify-between">
              <span>Pontos do Banco (Livelo / Esfera)</span>
              {totalBankPoints > 0 && (
                <button
                  type="button"
                  onClick={() => setSimPoints(totalBankPoints)}
                  className="text-[10px] text-cyan-300 hover:underline"
                >
                  Usar meu saldo ({totalBankPoints.toLocaleString('pt-BR')})
                </button>
              )}
            </label>
            <div className="relative">
              <input
                type="number"
                min={1000}
                step={5000}
                value={simPoints}
                onChange={(e) => setSimPoints(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full px-3 py-2 bg-[#0C021E] border border-purple-800/80 rounded-lg text-white font-mono text-sm focus:outline-none focus:border-[#22C55E]"
              />
              <span className="absolute right-3 top-2.5 text-xs text-slate-500 font-mono">pts</span>
            </div>
          </div>

          {/* Quick Select: Porcentagem de Bônus */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-slate-300">
              Taxa Promocional de Bônus
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {[50, 70, 80, 100].map(pct => (
                <button
                  key={pct}
                  type="button"
                  onClick={() => setSimBonusPercent(pct)}
                  className={`py-2 text-xs font-bold rounded-lg transition-all ${
                    simBonusPercent === pct
                      ? 'bg-[#22C55E] text-slate-950 shadow-[0_0_10px_rgba(34,197,94,0.4)]'
                      : 'bg-[#0C021E] text-slate-300 border border-purple-800/60 hover:bg-purple-900/40'
                  }`}
                >
                  +{pct}%
                </button>
              ))}
            </div>
          </div>

          {/* Input: Programa Destino */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-slate-300">
              Programa Aéreo de Destino
            </label>
            <select
              value={simSelectedProgram}
              onChange={(e) => setSimSelectedProgram(e.target.value)}
              className="w-full px-3 py-2 bg-[#0C021E] border border-purple-800/80 rounded-lg text-white text-sm focus:outline-none focus:border-[#22C55E]"
            >
              <option value="Smiles">Smiles (GOL + Parceiras)</option>
              <option value="LATAM Pass">LATAM Pass (LATAM + Delta)</option>
              <option value="Azul Fidelidade">Azul Fidelidade (Azul + United)</option>
              <option value="TAP Miles&Go">TAP Miles&Go (Star Alliance)</option>
              <option value="Iberia Plus">Iberia Plus (oneworld)</option>
            </select>
          </div>
        </div>

        {/* Simulator Results Bar */}
        <div className="p-4 rounded-xl bg-[#0B021B] border border-purple-900/60 grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
          <div className="p-2">
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Milhas Base</div>
            <div className="text-base font-bold text-slate-200 font-mono">
              {simPoints.toLocaleString('pt-BR')}
            </div>
          </div>

          <div className="p-2 border-y sm:border-y-0 sm:border-x border-purple-900/50">
            <div className="text-[10px] text-emerald-400 uppercase font-semibold flex items-center justify-center gap-1">
              <Sparkles className="w-3 h-3" />
              Bônus Gratuito Ganho
            </div>
            <div className="text-xl font-black text-[#22C55E] font-mono">
              +{simBonusMiles.toLocaleString('pt-BR')} milhas
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              Valor de mercado: ~R$ {Math.round(simEstimatedMoneyGain).toLocaleString('pt-BR')}
            </div>
          </div>

          <div className="p-2">
            <div className="text-[10px] text-cyan-400 uppercase font-semibold">Saldo Final no {simSelectedProgram}</div>
            <div className="text-xl font-black text-white font-mono">
              {simTotalResult.toLocaleString('pt-BR')}
            </div>
            <div className="text-[10px] text-cyan-300/80 mt-0.5">
              Pronto para emissões no radar
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

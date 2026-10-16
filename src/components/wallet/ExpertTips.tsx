import React, { useState, useMemo } from 'react';
import { useFlySync } from '../../store/FlySyncContext';
import { FlightOffer } from '../../types';
import { findAirportByIata } from '../../data/airports';
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
  ExternalLink,
  User,
  MapPin,
  Armchair,
  Check,
  Flame,
  Target
} from 'lucide-react';

export type TipCategory = 'all' | 'sweet_spot' | 'bonus_transfer' | 'expiration' | 'card_strategy';

export interface ExpertTipItem {
  id: string;
  category: TipCategory;
  priority: 'urgent' | 'high' | 'medium' | 'growth';
  title: string;
  badge: string;
  badgeColor: string;
  clientContextPill?: string; // Ex: "Baseado em GRU", "Seu Saldo: 84.500 Smiles", "Destino Favorito: Miami"
  summary: string;
  detailedAnalysis: string;
  potentialGainLabel: string;
  potentialMiles: number;
  actionLabel?: string;
  actionType?: 'campaigns' | 'radar' | 'calculator' | 'transfer_simulator' | 'profile';
  actionRoute?: { origin: string; dest: string };
  isApplied?: boolean;
}

interface ExpertTipsProps {
  onNavigate?: (tab: string) => void;
}

export const ExpertTips: React.FC<ExpertTipsProps> = ({ onNavigate }) => {
  const {
    user,
    updateUserPreferences,
    balances,
    programs,
    campaigns,
    offers,
    savedSearches,
    getConsolidatedTotals,
    setSelectedOffer
  } = useFlySync();

  const [activeCategory, setActiveCategory] = useState<TipCategory>('all');
  const [expandedTipId, setExpandedTipId] = useState<string | null>('tip-profile-sweetspot');
  const [completedTipIds, setCompletedTipIds] = useState<Set<string>>(new Set());

  // Interactive Transfer Simulator State
  const [simPoints, setSimPoints] = useState<number>(100000);
  const [simBonusPercent, setSimBonusPercent] = useState<number>(80);
  const [simSelectedProgram, setSimSelectedProgram] = useState<string>('Smiles');

  // Client Profile Preferences Extraction
  const userName = user.displayName?.split(' ')[0] || 'Viajante';
  const preferredOrigin = user.preferences?.preferredOrigin || 'GRU';
  const preferredCabin = user.preferences?.preferredCabin || 'economy';
  const favoriteDestinations = useMemo(() => {
    return user.preferences?.favoriteDestinations && user.preferences.favoriteDestinations.length > 0
      ? user.preferences.favoriteDestinations
      : ['MIA', 'LIS', 'MAD', 'REC', 'SCL'];
  }, [user.preferences?.favoriteDestinations]);

  const originAirportObj = findAirportByIata(preferredOrigin);
  const originCityName = originAirportObj?.city || preferredOrigin;

  const totals = getConsolidatedTotals();
  const totalCombined = totals.airlineMiles + totals.bankPoints + totals.avios;

  // Program Balances
  const liveloBal = balances.find(b => b.programId === 'prog-livelo')?.balance || 0;
  const esferaBal = balances.find(b => b.programId === 'prog-esfera')?.balance || 0;
  const totalBankPoints = liveloBal + esferaBal;

  const smilesBal = balances.find(b => b.programId === 'prog-smiles')?.balance || 0;
  const latamBal = balances.find(b => b.programId === 'prog-latampass')?.balance || 0;
  const azulBal = balances.find(b => b.programId === 'prog-azul')?.balance || 0;
  const iberiaBal = balances.find(b => b.programId === 'prog-iberia')?.balance || 0;
  const tapBal = balances.find(b => b.programId === 'prog-tap')?.balance || 0;

  // Check for expiring balances in next 60 days
  const expiringSoonBalances = useMemo(() => {
    const now = Date.now();
    return balances
      .filter(b => {
        if (!b.expiresAt) return false;
        const exp = new Date(b.expiresAt).getTime();
        const diffDays = Math.ceil((exp - now) / (1000 * 60 * 60 * 24));
        return diffDays > 0 && diffDays <= 60;
      })
      .sort((a, b) => new Date(a.expiresAt!).getTime() - new Date(b.expiresAt!).getTime());
  }, [balances]);

  // Active Campaign
  const topCampaign = useMemo(() => {
    return campaigns.find(c => c.isActive && (c.bonusPercentage || 0) >= 60) || campaigns[0];
  }, [campaigns]);

  // Quick switch handlers for client profile right from ExpertTips
  const handleToggleCabin = (newCabin: 'economy' | 'business') => {
    updateUserPreferences({ preferredCabin: newCabin });
  };

  const handleChangeOrigin = (newOrigin: string) => {
    updateUserPreferences({ preferredOrigin: newOrigin.toUpperCase() });
  };

  // GENERATE 100% REAL, PERSONALIZED EXPERT TIPS ACCORDING TO CLIENT PROFILE
  const tips: ExpertTipItem[] = useMemo(() => {
    const generated: ExpertTipItem[] = [];
    const todayStr = new Date().toISOString().split('T')[0];
    const activeOffers = offers.filter(o => o.status === 'ativa' && o.departureDate >= todayStr);

    // -------------------------------------------------------------
    // TIP 1: EMISSÃO IMEDIATA NO SEU DESTINO FAVORITO (Saldo Real Suficiente)
    // -------------------------------------------------------------
    // Encontra voos no Radar que partem da origem preferida do cliente para os destinos favoritos
    const favOffersFromOrigin = activeOffers.filter(
      o => (o.origin === preferredOrigin || o.originCity.toLowerCase().includes(originCityName.toLowerCase())) &&
           favoriteDestinations.includes(o.destination.toUpperCase())
    );

    // Ordena por milhas crescente
    const sortedFavOffers = [...favOffersFromOrigin].sort((a, b) => a.miles - b.miles);

    // Verifica se o cliente tem saldo para emitir algum deles
    let foundAffordableFav: { offer: FlightOffer; userBal: number; progName: string } | null = null;
    for (const off of sortedFavOffers) {
      let b = 0;
      let pName = 'Programa';
      if (off.programId === 'prog-smiles') { b = smilesBal; pName = 'Smiles (GOL)'; }
      else if (off.programId === 'prog-latampass') { b = latamBal; pName = 'LATAM Pass'; }
      else if (off.programId === 'prog-azul') { b = azulBal; pName = 'Azul'; }
      else if (off.programId === 'prog-tap') { b = tapBal; pName = 'TAP Miles&Go'; }
      else if (off.programId === 'prog-iberia') { b = iberiaBal; pName = 'Iberia Plus'; }

      if (b >= off.miles) {
        foundAffordableFav = { offer: off, userBal: b, progName: pName };
        break;
      }
    }

    if (foundAffordableFav) {
      const { offer: off, userBal, progName } = foundAffordableFav;
      const leftover = userBal - off.miles;
      const canRoundTrip = userBal >= off.miles * 2;

      generated.push({
        id: 'tip-profile-sweetspot',
        category: 'sweet_spot',
        priority: 'high',
        title: `Destino Favorito Liberado: ${off.origin} ➔ ${off.destCity} por ${off.miles.toLocaleString('pt-BR')} milhas`,
        badge: 'Saldo Real Suficiente',
        badgeColor: 'bg-[#22C55E]/20 text-[#22C55E] border-emerald-500/40',
        clientContextPill: `Favorito: ${off.destCity} · ${progName}`,
        summary: `Você tem ${userBal.toLocaleString('pt-BR')} milhas no ${progName}. Esse voo no Radar custa apenas ${off.miles.toLocaleString('pt-BR')} milhas (${canRoundTrip ? 'seu saldo cobre ida e volta!' : `ainda sobram ${leftover.toLocaleString('pt-BR')} milhas`}).`,
        detailedAnalysis: `Análise personalizada para o perfil de ${userName}:
• Origem: ${off.origin} (${off.originCity}) ➔ Destino: ${off.destination} (${off.destCity}).
• Companhia Operadora: ${off.airline}.
• Tarifa de emissão: ${off.miles.toLocaleString('pt-BR')} milhas + R$ ${off.cashAmount.toFixed(2)} taxas de embarque.
• Seu saldo no ${progName}: ${userBal.toLocaleString('pt-BR')} milhas disponíveis.
${canRoundTrip
  ? `• Oportunidade de Ouro: Seu saldo cobre a viagem COMPLETA de Ida e Volta (${(off.miles * 2).toLocaleString('pt-BR')} milhas) e você ainda preserva ${(userBal - off.miles * 2).toLocaleString('pt-BR')} milhas!`
  : `• Você pode emitir o trecho de ida imediatamente e garantir a vaga antes que a tarifa promocional mude.`}
• Dica prática: Os assentos promocionais no radar costumam esgotar rapidamente. Confira as datas disponíveis no calendário da rota.`,
        potentialGainLabel: 'Emissão Atingível',
        potentialMiles: off.miles,
        actionLabel: 'Ver Datas no Radar',
        actionType: 'radar',
        actionRoute: { origin: off.origin, dest: off.destination }
      });
    }

    // -------------------------------------------------------------
    // TIP 2: RESGATE DE EMERGÊNCIA / ANTI-VENCIMENTO (Dados Reais)
    // -------------------------------------------------------------
    if (expiringSoonBalances.length > 0) {
      const targetBal = expiringSoonBalances[0];
      const prog = programs.find(p => p.id === targetBal.programId);
      const daysLeft = Math.ceil((new Date(targetBal.expiresAt!).getTime() - Date.now()) / (1000 * 60 * 60 * 24));

      // Procura se tem algum voo da origem do cliente nesse programa que caiba no saldo vencendo
      const rescueFlight = activeOffers.find(
        o => o.programId === targetBal.programId &&
             o.origin === preferredOrigin &&
             o.miles <= targetBal.balance * 1.15
      );

      generated.push({
        id: 'tip-expiration-rescue',
        category: 'expiration',
        priority: 'urgent',
        title: `Resgate Anti-Vencimento: ${targetBal.balance.toLocaleString('pt-BR')} ${prog?.unitLabel || 'milhas'} vencem em ${daysLeft} dias`,
        badge: `Vence em ${daysLeft} dias (${prog?.name})`,
        badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
        clientContextPill: `Alerta: ${prog?.name}`,
        summary: `Evite queimar milhas em produtos com valor depreciado. Resgate um voo com antecedência e proteja seu patrimônio.`,
        detailedAnalysis: `Atenção, ${userName}! Pontos que expiram geram prejuízo direto.
${rescueFlight
  ? `• Solução Imediata no Radar: Encontramos o voo ${rescueFlight.origin} ➔ ${rescueFlight.destCity} (${rescueFlight.destination}) por ${rescueFlight.miles.toLocaleString('pt-BR')} milhas no ${prog?.name}!
• Ao emitir essa passagem, você estende o benefício para viajar em até 330 dias e não perde absolutamente nada.`
  : `• Recomendação: Se não for viajar imediatamente, emita uma passagem flexível nacional saindo de ${preferredOrigin} ou verifique a transferência para programas parceiros.`}
• Por que não trocar por produtos? Em lojas parceiras, o milheiro vale menos de R$ 14,00. Em passagens no Radar, o milheiro chega a valer R$ 35,00 a R$ 75,00!`,
        potentialGainLabel: 'Saldo Protegido',
        potentialMiles: targetBal.balance,
        actionLabel: 'Buscar Voos no Radar',
        actionType: 'radar',
        actionRoute: rescueFlight ? { origin: rescueFlight.origin, dest: rescueFlight.destination } : undefined
      });
    }

    // -------------------------------------------------------------
    // TIP 3: MULTIPLICAÇÃO BONIFICADA (Pontos Bancários ➔ Voo Desejado)
    // -------------------------------------------------------------
    if (totalBankPoints > 0) {
      const bonusPct = topCampaign?.bonusPercentage || 80;
      const bonusMiles = Math.round(totalBankPoints * (bonusPct / 100));
      const simulatedFinalMiles = totalBankPoints + bonusMiles;

      // Procura um voo internacional ou de alto valor que essa multiplicação destrava
      const unlockedFlight = activeOffers.find(
        o => (o.origin === preferredOrigin || o.origin === 'GRU') &&
             o.miles <= simulatedFinalMiles &&
             o.miles > totalBankPoints
      );

      generated.push({
        id: 'tip-bank-arbitrage',
        category: 'bonus_transfer',
        priority: 'high',
        title: `Multiplicação: Seus ${totalBankPoints.toLocaleString('pt-BR')} pontos viram ${simulatedFinalMiles.toLocaleString('pt-BR')} milhas (+${bonusPct}%)`,
        badge: `Campanha +${bonusPct}% Ativa`,
        badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
        clientContextPill: `Bancos: Livelo/Esfera`,
        summary: `Você possui ${totalBankPoints.toLocaleString('pt-BR')} pontos bancários. Com a promoção de +${bonusPct}%, você ganha +${bonusMiles.toLocaleString('pt-BR')} milhas sem pagar nada.`,
        detailedAnalysis: `Estratégia personalizada para o perfil de ${userName}:
• Seus pontos em banco (Livelo e Esfera) nunca devem ser transferidos na proporção padrão 1:1.
• Campanha ativa identificada no FlySync: Transferência bonificada com até ${bonusPct}% de bônus para ${topCampaign?.targetProgramName || 'Smiles / LATAM'}.
• Resultado da operação:
  - Pontos transferidos: ${totalBankPoints.toLocaleString('pt-BR')}
  - Bônus creditado gratuitamente: +${bonusMiles.toLocaleString('pt-BR')} milhas
  - Saldo final resultante: ${simulatedFinalMiles.toLocaleString('pt-BR')} milhas
${unlockedFlight
  ? `• O que isso destrava no Radar: Você atinge o saldo para emitir ${unlockedFlight.origin} ➔ ${unlockedFlight.destCity} (${unlockedFlight.destination}) por ${unlockedFlight.miles.toLocaleString('pt-BR')} milhas!`
  : `• Esse saldo adicional já permite emitir trechos internacionais de ida e volta para a América do Sul ou trechos para os EUA.`}
• Economia financeira estimada: ~R$ ${Math.round((bonusMiles / 1000) * 17.5).toLocaleString('pt-BR')}.`,
        potentialGainLabel: 'Bônus Gratuito',
        potentialMiles: bonusMiles,
        actionLabel: 'Simular Transferência',
        actionType: 'transfer_simulator'
      });
    }

    // -------------------------------------------------------------
    // TIP 4: SWEET SPOT DE CABINE (Executiva vs Econômica)
    // -------------------------------------------------------------
    if (preferredCabin === 'business') {
      // Perfil focado em Executiva
      const neededAvios = 42500;
      const aviosDiff = Math.max(0, neededAvios - iberiaBal);
      const hasEnoughAvios = aviosDiff === 0;

      generated.push({
        id: 'tip-cabin-business',
        category: 'sweet_spot',
        priority: 'high',
        title: hasEnoughAvios
          ? `Cabine Executiva Pronta: São Paulo ➔ Madri por 42.500 Avios`
          : `Cabine Executiva Iberia: Faltam ${aviosDiff.toLocaleString('pt-BR')} Avios para lie-flat na Europa`,
        badge: 'Sweet Spot Executiva',
        badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
        clientContextPill: `Preferência: Classe Executiva`,
        summary: `Como sua preferência é Classe Executiva, a tabela do Iberia Plus (42.500 Avios São Paulo ➔ Madri em baixa temporada) é a mais vantajosa do mundo.`,
        detailedAnalysis: `Avaliação do seu perfil de cabine Executiva:
• Rota: GRU / GIG ➔ MAD (Madri) em voo direto operado pelo moderno Airbus A350 da Iberia.
• Custo em Avios: 42.500 Avios o trecho em períodos off-peak (baixa temporada: março a maio e setembro a novembro).
• Comparativo em Dinheiro: Essa mesma passagem comprada em Reais custa entre R$ 13.000 e R$ 19.000.
• Seu saldo no Iberia Plus: ${iberiaBal.toLocaleString('pt-BR')} Avios.
${hasEnoughAvios
  ? '• Parabéns! Seu saldo é SUFICIENTE para emitir esse trecho de Executiva agora mesmo!'
  : `• Como completar os ${aviosDiff.toLocaleString('pt-BR')} Avios que faltam: Transfira da Esfera ou Livelo na paridade 2:1 quando houver campanhas com desconto na compra de pontos.`}
• Valor extraído por milheiro: Superior a R$ 90,00 por cada 1.000 Avios!`,
        potentialGainLabel: 'Valor de Executiva',
        potentialMiles: 42500,
        actionLabel: 'Ver Madri no Radar',
        actionType: 'radar',
        actionRoute: { origin: 'GRU', dest: 'MAD' }
      });
    } else {
      // Perfil focado em Econômica (Máxima eficiência de trechos)
      generated.push({
        id: 'tip-cabin-economy',
        category: 'sweet_spot',
        priority: 'growth',
        title: `América do Sul sem Conexão: Santiago e Buenos Aires a partir de 14.200 milhas`,
        badge: 'Eficiência de Trechos',
        badgeColor: 'bg-[#22C55E]/20 text-[#22C55E] border-emerald-500/40',
        clientContextPill: `Preferência: Econômica Inteligente`,
        summary: `Com seu saldo consolidado de ${totalCombined.toLocaleString('pt-BR')} milhas, você tem poder para realizar múltiplas viagens internacionais curtas ao ano.`,
        detailedAnalysis: `Análise para o perfil de ${userName} focado em Classe Econômica:
• Saindo da sua base em ${originCityName} (${preferredOrigin}), as emissões mais eficientes da América do Sul operam entre 14.000 e 22.000 milhas o trecho.
• Destinos recomendados no Radar:
  - Santiago (SCL): A partir de 14.200 milhas (LATAM / Smiles).
  - Buenos Aires (EZE/AEP): A partir de 16.500 milhas com taxas baixas.
  - Bariloche (BRC): Perfeito para temporada de neve por 24.000 milhas.
• Ao emitir em econômica nessas rotas curtas, a taxa de embarque fica entre R$ 39 e R$ 180, gerando a maior relação de economia em dinheiro vivo.`,
        potentialGainLabel: 'Múltiplos Trechos',
        potentialMiles: 30000,
        actionLabel: 'Ver Santiago no Radar',
        actionType: 'radar',
        actionRoute: { origin: preferredOrigin, dest: 'SCL' }
      });
    }

    // -------------------------------------------------------------
    // TIP 5: ROTAS MONITORADAS NOS ALERTAS (Se o cliente tem savedSearches)
    // -------------------------------------------------------------
    if (savedSearches.length > 0) {
      const topSearch = savedSearches[0];
      const matchInRadar = activeOffers.find(
        o => o.origin === topSearch.origin && o.destination === topSearch.destination
      );

      if (matchInRadar) {
        const isUnderBudget = matchInRadar.miles <= topSearch.maxMiles;
        generated.push({
          id: 'tip-saved-search-match',
          category: 'sweet_spot',
          priority: isUnderBudget ? 'urgent' : 'medium',
          title: isUnderBudget
            ? `Alerta Ativo: ${topSearch.origin} ➔ ${topSearch.destination} bateu ${matchInRadar.miles.toLocaleString('pt-BR')} milhas!`
            : `Monitoramento de Rota: ${topSearch.origin} ➔ ${topSearch.destination} hoje por ${matchInRadar.miles.toLocaleString('pt-BR')} milhas`,
          badge: isUnderBudget ? 'Abaixo do seu Teto' : 'Radar em Monitoramento',
          badgeColor: isUnderBudget ? 'bg-[#22C55E]/20 text-[#22C55E] border-emerald-500/40' : 'bg-purple-500/20 text-purple-300 border-purple-500/40',
          clientContextPill: `Alerta: ${topSearch.origin} ➔ ${topSearch.destination}`,
          summary: `Seu radar configurado tem teto de ${topSearch.maxMiles.toLocaleString('pt-BR')} milhas. A melhor tarifa encontrada hoje é de ${matchInRadar.miles.toLocaleString('pt-BR')} milhas (${matchInRadar.airline}).`,
          detailedAnalysis: `Acompanhamento em tempo real para a sua rota cadastrada:
• Rota: ${topSearch.origin} ➔ ${topSearch.destination}.
• Seu teto estipulado: ${topSearch.maxMiles.toLocaleString('pt-BR')} milhas.
• Menor valor no Radar hoje: ${matchInRadar.miles.toLocaleString('pt-BR')} milhas no ${matchInRadar.programId.replace('prog-', '')}.
${isUnderBudget
  ? `• Oportunidade Confirmada: O valor atual está ${((1 - matchInRadar.miles / topSearch.maxMiles) * 100).toFixed(0)}% ABAIXO do teto que você definiu! Recomendamos emitir agora antes que a companhia encerre a classe tarifária.`
  : `• Status: O preço atual está ligeiramente acima da sua meta. Mantenha os alertas Push e WhatsApp ativos para ser avisado assim que houver redução de tarifa.`}`,
          potentialGainLabel: 'Economia na Rota',
          potentialMiles: Math.max(0, topSearch.maxMiles - matchInRadar.miles) || matchInRadar.miles,
          actionLabel: 'Ver Oferta no Radar',
          actionType: 'radar',
          actionRoute: { origin: topSearch.origin, dest: topSearch.destination }
        });
      }
    }

    // -------------------------------------------------------------
    // TIP 6: ESTRATÉGIA DE HUB PARA A ORIGEM DO CLIENTE
    // -------------------------------------------------------------
    const isSaoPaulo = ['GRU', 'CGH', 'VCP'].includes(preferredOrigin);
    const isRio = ['GIG', 'SDU'].includes(preferredOrigin);
    const isNordeste = ['REC', 'SSA', 'FOR', 'NAT', 'MCZ'].includes(preferredOrigin);

    generated.push({
      id: 'tip-hub-strategy',
      category: 'card_strategy',
      priority: 'growth',
      title: `Estratégia de Hub para sua Base em ${originCityName} (${preferredOrigin})`,
      badge: 'Geografia Inteligente',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      clientContextPill: `Sua Base: ${preferredOrigin}`,
      summary: isSaoPaulo
        ? `Por estar em São Paulo, você tem acesso a todos os hubs diretos do país. A melhor estratégia é concentrar pontos em bancos flexíveis.`
        : isRio
        ? `No Rio de Janeiro, o Galeão possui voos internacionais de alto valor na Smiles (Delta/Air France) e Iberia.`
        : isNordeste
        ? `No Nordeste, você tem o trecho mais curto do país para a Europa (Lisboa e Madri), com as menores taxas em milhas.`
        : `Saindo de ${originCityName}, conexões rápidas via LATAM e Smiles oferecem o melhor custo-benefício de emissão.`,
      detailedAnalysis: `Diretrizes de especialista para quem parte de ${originCityName}:
${isSaoPaulo
  ? `• GRU é o principal hub internacional: LATAM Pass domina voos próprios para Miami, Orlando, Madri e Roma. A Smiles emite parceiras oneworld e SkyTeam com excelentes disponibilidades.
• Viracopos (VCP): O hub da Azul é imbatível para voos diretos para Lisboa, Paris (Orly) e Orlando com a Azul Fidelidade.
• Regra prática: Mantenha seus pontos em Livelo ou Esfera até o momento da emissão, permitindo escolher entre Smiles, LATAM ou Azul de acordo com a vaga do radar.`
  : isNordeste
  ? `• Vantagem única: Voos diretos do Nordeste (REC/SSA/FOR) para Lisboa (TAP) e Madri (Air Europa/Iberia) exigem até 25% menos milhas do que voos saindo do Sudeste devido à menor distância geográfica.
• Dica de ouro: Monitore a TAP Miles&Go e a Smiles para emissões diretas sem escalas para a Europa.`
  : `• Como sua cidade exige conexão para voos intercontinentais, prefira emissões em companhias que não cobram pelo trecho doméstico conectado (ex: LATAM Pass e Smiles costumam incluir o trecho de conexão com pouca ou nenhuma sobretaxa de milhas).`}`,
      potentialGainLabel: 'Eficiência de Acúmulo',
      potentialMiles: 25000,
      actionLabel: 'Ver Campanhas de Bancos',
      actionType: 'campaigns'
    });

    // -------------------------------------------------------------
    // TIP 7: NÍVEL DO PLANO (Free vs VIP)
    // -------------------------------------------------------------
    if (user.plan === 'free') {
      generated.push({
        id: 'tip-plan-upgrade',
        category: 'card_strategy',
        priority: 'medium',
        title: `Velocidade de Emissão: Assentos Tarifados Esgotam em Menos de 40 Minutos`,
        badge: 'Alerta de Escassez',
        badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
        clientContextPill: `Plano Gratuito`,
        summary: `As melhores emissões encontradas pelos nossos robôs têm vagas limitadas (frequentemente 2 a 4 assentos promocionais por voo).`,
        detailedAnalysis: `Dica de timing para ${userName}:
• No mercado de milhas, a melhor tarifa é passageira: companhias abrem vagas de classe tarifária promocional (award) que esgotam rapidamente quando divulgadas em grupos públicos.
• O Plano VIP do FlySync notifica imediatamente via WhatsApp e Notificação Push no momento em que o scraper detecta a queda de preço, dando a você 20 a 40 minutos de vantagem competitiva para emitir antes dos demais.
• Se você viaja com família ou busca Classe Executiva, ter alerta imediato é a diferença entre conseguir a vaga ou ver a passagem dobrar de preço.`,
        potentialGainLabel: 'Vantagem de Timing',
        potentialMiles: 40000,
        actionLabel: 'Conhecer Plano VIP',
        actionType: 'profile'
      });
    }

    return generated;
  }, [
    userName,
    preferredOrigin,
    preferredCabin,
    originCityName,
    favoriteDestinations,
    balances,
    programs,
    campaigns,
    offers,
    savedSearches,
    smilesBal,
    latamBal,
    azulBal,
    iberiaBal,
    tapBal,
    totalBankPoints,
    totalCombined,
    expiringSoonBalances,
    topCampaign,
    user.plan
  ]);

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
  const totalPotentialGains = tips.reduce(
    (sum, t) => sum + (completedTipIds.has(t.id) ? 0 : t.potentialMiles),
    0
  );

  const handleActionClick = (actionType?: string, actionRoute?: { origin: string; dest: string }) => {
    if (!actionType) return;
    if (actionType === 'radar') {
      if (onNavigate) {
        onNavigate('radar');
      } else {
        window.location.hash = '#radar';
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (actionType === 'calculator') {
      const el = document.getElementById('miles-calculator');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    } else if (actionType === 'campaigns') {
      if (onNavigate) {
        onNavigate('campaigns');
      } else {
        window.location.hash = '#campaigns';
      }
    } else if (actionType === 'profile') {
      if (onNavigate) {
        onNavigate('profile');
      } else {
        window.location.hash = '#profile';
      }
    } else if (actionType === 'transfer_simulator') {
      const el = document.getElementById('transfer-bonus-simulator');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div
      id="expert-tips"
      className="p-5 sm:p-6 rounded-2xl bg-[#13062C] border border-purple-900/60 shadow-xl space-y-6 relative overflow-hidden text-white"
    >
      {/* Decorative ambient gradient backdrop */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-emerald-500/10 via-cyan-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header section with brand identity styling */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-purple-900/40 relative z-10">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 mb-1.5 flex-wrap">
            <span className="p-1 rounded-md bg-[#22C55E]/15 border border-[#22C55E]/30 text-[#22C55E]">
              <Lightbulb className="w-3.5 h-3.5" />
            </span>
            <span className="tracking-wide uppercase text-[11px] font-bold text-slate-300">
              Inteligência de Fidelidade FlySync
            </span>
            <span aria-hidden="true" className="text-purple-400">·</span>
            <span className="text-cyan-300 font-bold">Dicas Reais do Perfil de {userName}</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2 flex-wrap">
            <span>Dicas Personalizadas de Especialista</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-[#22C55E]/15 text-[#22C55E] border border-[#22C55E]/30">
              {tips.length} Estratégias
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-3xl leading-relaxed">
            Cruzamento dinâmico entre seus saldos reais, prazos de validade e as melhores passagens do radar para a sua base em <strong>{originCityName} ({preferredOrigin})</strong>.
          </p>
        </div>

        {/* Highlight metric card: Potencial de Ganho */}
        <div className="shrink-0 p-3.5 rounded-xl bg-gradient-to-r from-[#180838] to-[#1F0A44] border border-purple-800/80 shadow-md flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-[#22C55E]/15 border border-[#22C55E]/30 flex items-center justify-center text-[#22C55E] shrink-0">
            <Zap className="w-5 h-5 fill-[#22C55E]/20" />
          </div>
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Economia / Valor Destravável
            </div>
            <div className="text-lg font-black font-mono text-white flex items-baseline gap-1">
              <span className="text-[#22C55E]">+{totalPotentialGains.toLocaleString('pt-BR')}</span>
              <span className="text-xs text-slate-400 font-sans font-normal">milhas</span>
            </div>
            <div className="text-[10px] text-cyan-300 font-medium">
              Equivalente a ~R$ {Math.round((totalPotentialGains / 1000) * 17.5).toLocaleString('pt-BR')} em passagens
            </div>
          </div>
        </div>
      </div>

      {/* PAINEL DE CONTEXTO DO PERFIL DO CLIENTE (Interativo & Vivo) */}
      <div className="p-3.5 sm:p-4 rounded-xl bg-[#0F0324] border border-purple-900/70 relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-950/60 border border-purple-800/60">
            <User className="w-3.5 h-3.5 text-[#22C55E]" />
            <span className="text-slate-300">Cliente:</span>
            <strong className="text-white">{userName}</strong>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-purple-800/60 text-purple-200">
              {user.plan === 'premium' ? 'VIP' : 'Free'}
            </span>
          </div>

          {/* Quick Origin Selector */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-950/60 border border-purple-800/60">
            <MapPin className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-slate-300">Origem:</span>
            <select
              value={preferredOrigin}
              onChange={(e) => handleChangeOrigin(e.target.value)}
              className="bg-transparent text-white font-bold outline-none cursor-pointer text-xs"
              title="Trocar aeroporto de partida principal para recalcular dicas"
            >
              <option value="GRU" className="bg-[#13062C] text-white">GRU (São Paulo)</option>
              <option value="CGH" className="bg-[#13062C] text-white">CGH (São Paulo Congonhas)</option>
              <option value="VCP" className="bg-[#13062C] text-white">VCP (Campinas)</option>
              <option value="GIG" className="bg-[#13062C] text-white">GIG (Rio Galeão)</option>
              <option value="SDU" className="bg-[#13062C] text-white">SDU (Rio Santos Dumont)</option>
              <option value="BSB" className="bg-[#13062C] text-white">BSB (Brasília)</option>
              <option value="CNF" className="bg-[#13062C] text-white">CNF (Belo Horizonte)</option>
              <option value="REC" className="bg-[#13062C] text-white">REC (Recife)</option>
              <option value="SSA" className="bg-[#13062C] text-white">SSA (Salvador)</option>
              <option value="FOR" className="bg-[#13062C] text-white">FOR (Fortaleza)</option>
              <option value="POA" className="bg-[#13062C] text-white">POA (Porto Alegre)</option>
              <option value="CWB" className="bg-[#13062C] text-white">CWB (Curitiba)</option>
              <option value="FLN" className="bg-[#13062C] text-white">FLN (Florianópolis)</option>
            </select>
          </div>

          {/* Quick Cabin Switcher */}
          <div className="flex items-center gap-1 bg-[#180838] p-0.5 rounded-lg border border-purple-800/60">
            <button
              type="button"
              onClick={() => handleToggleCabin('economy')}
              className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all cursor-pointer ${
                preferredCabin === 'economy'
                  ? 'bg-[#22C55E] text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Econômica
            </button>
            <button
              type="button"
              onClick={() => handleToggleCabin('business')}
              className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all cursor-pointer ${
                preferredCabin === 'business'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Executiva
            </button>
          </div>
        </div>

        {/* Favorite Destinations Tags */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          <span className="text-[10px] text-slate-400 uppercase font-semibold shrink-0">Favoritos:</span>
          {favoriteDestinations.slice(0, 5).map(dest => (
            <span
              key={dest}
              className="text-[10px] px-2 py-0.5 rounded bg-purple-900/50 border border-purple-800/50 text-purple-200 font-mono font-bold"
            >
              {dest}
            </span>
          ))}
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
          { key: 'sweet_spot', label: 'Resgates & Destinos' },
          { key: 'bonus_transfer', label: 'Bônus de Transferência' },
          { key: 'expiration', label: 'Alerta de Vencimento' },
          { key: 'card_strategy', label: 'Estratégia de Hub' }
        ].map(cat => {
          const isActive = activeCategory === cat.key;
          return (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(cat.key as TipCategory)}
              className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition-all cursor-pointer ${
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
                        {tip.clientContextPill && (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-purple-900/40 text-purple-200 border border-purple-800/40 flex items-center gap-1">
                            <Target className="w-3 h-3 text-[#22C55E]" />
                            {tip.clientContextPill}
                          </span>
                        )}
                        {tip.priority === 'urgent' && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            Ação Imediata
                          </span>
                        )}
                        <span className="text-[10px] text-slate-400 font-mono">
                          {tip.potentialGainLabel}:{' '}
                          <strong className="text-white">+{tip.potentialMiles.toLocaleString('pt-BR')} milhas</strong>
                        </span>
                      </div>

                      <h3
                        className={`text-sm sm:text-base font-bold text-white tracking-tight ${
                          isCompleted ? 'line-through text-slate-400' : ''
                        }`}
                      >
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
                        <span>Calculado com dados reais do seu portfólio</span>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap">
                        {tip.actionLabel && (
                          <button
                            type="button"
                            onClick={() => handleActionClick(tip.actionType, tip.actionRoute)}
                            className="px-3.5 py-1.5 rounded-lg text-xs font-bold text-slate-950 bg-[#22C55E] hover:bg-emerald-400 transition-colors flex items-center gap-1.5 shadow-[0_0_12px_rgba(34,197,94,0.3)] cursor-pointer"
                          >
                            <span>{tip.actionLabel}</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={(e) => toggleCompleted(tip.id, e)}
                          className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white bg-purple-900/30 hover:bg-purple-900/50 border border-purple-800/60 transition-colors cursor-pointer"
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
      <div
        id="transfer-bonus-simulator"
        className="p-5 sm:p-6 rounded-xl bg-gradient-to-br from-[#160833] to-[#120526] border border-purple-800/80 shadow-lg space-y-4 relative z-10"
      >
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
                Calcule em tempo real o salto dos seus pontos bancários para os programas aéreos
              </p>
            </div>
          </div>

          <span className="text-[11px] font-mono text-[#22C55E] bg-[#22C55E]/10 border border-[#22C55E]/20 px-2.5 py-1 rounded-md self-start sm:self-auto font-semibold">
            Bônus Selecionado: +{simBonusPercent}%
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
                  className="text-[10px] text-cyan-300 hover:underline cursor-pointer"
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
                  className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
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
              className="w-full px-3 py-2 bg-[#0C021E] border border-purple-800/80 rounded-lg text-white text-sm focus:outline-none focus:border-[#22C55E] cursor-pointer"
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
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Pontos Base</div>
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

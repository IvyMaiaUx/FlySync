import React, { useState } from 'react';
import { useFlySync } from '../../store/FlySyncContext';
import {
  User,
  Star,
  Wallet,
  MapPin,
  Tag,
  Bell,
  Lock,
  HelpCircle,
  LogOut,
  ChevronRight,
  ArrowLeft,
  Check,
  Plus,
  Trash2,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { getDestinationImageUrl } from '../../data/destinationImages';

interface ProfileViewProps {
  onNavigate: (tab: string) => void;
  onOpenUpgrade: () => void;
  onOpenAuth: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ onNavigate, onOpenUpgrade, onOpenAuth }) => {
  const { user, updateUserPreferences, isAuthenticated } = useFlySync();

  // Sub-view navigation inside profile: 'main' | 'favorites' | 'emissions' | 'account'
  const [subView, setSubView] = useState<'main' | 'favorites' | 'emissions' | 'account'>('main');

  // Account form state
  const [name, setName] = useState<string>(user.displayName || 'Ivy Maia');
  const [email, setEmail] = useState<string>(user.email || 'ivy@flysync.app');
  const [phone, setPhone] = useState<string>(user.preferences.phone || '(11) 98765-4321');
  const [preferredOrigin, setPreferredOrigin] = useState<string>(user.preferences.preferredOrigin || 'GRU');
  const [preferredCabin, setPreferredCabin] = useState<'Econômica' | 'Executiva'>(
    user.preferences.preferredCabin === 'business' ? 'Executiva' : 'Econômica'
  );
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  // Favorites state
  const [favType, setFavType] = useState<'d' | 'o'>('d');
  const [newFavAirport, setNewFavAirport] = useState<string>('');
  const [favoriteDestinations, setFavoriteDestinations] = useState<string[]>(
    user.preferences.favoriteDestinations && user.preferences.favoriteDestinations.length > 0
      ? user.preferences.favoriteDestinations
      : ['REC', 'MAD', 'MIA', 'LIS']
  );
  const [favoriteOrigins, setFavoriteOrigins] = useState<string[]>(
    user.preferences.favoriteOrigins && user.preferences.favoriteOrigins.length > 0
      ? user.preferences.favoriteOrigins
      : ['GRU', 'GIG', 'CNF']
  );

  const handleAddFavorite = () => {
    const code = newFavAirport.trim().toUpperCase();
    if (!code) return;
    if (favType === 'd') {
      if (!favoriteDestinations.includes(code)) {
        const next = [...favoriteDestinations, code];
        setFavoriteDestinations(next);
        updateUserPreferences({ favoriteDestinations: next });
      }
    } else {
      if (!favoriteOrigins.includes(code)) {
        const next = [...favoriteOrigins, code];
        setFavoriteOrigins(next);
        updateUserPreferences({ favoriteOrigins: next });
      }
    }
    setNewFavAirport('');
  };

  const handleRemoveFavorite = (code: string) => {
    if (favType === 'd') {
      const next = favoriteDestinations.filter(c => c !== code);
      setFavoriteDestinations(next);
      updateUserPreferences({ favoriteDestinations: next });
    } else {
      const next = favoriteOrigins.filter(c => c !== code);
      setFavoriteOrigins(next);
      updateUserPreferences({ favoriteOrigins: next });
    }
  };

  const handleSaveAccount = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserPreferences({
      displayName: name,
      email,
      phone,
      preferredOrigin,
      preferredCabin: preferredCabin === 'Executiva' ? 'business' : 'economy',
      favoriteDestinations,
      favoriteOrigins
    } as any);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  // Demo user emissions
  const [emissions] = useState([
    {
      id: 'em-1',
      route: 'GRU → MAD',
      city: 'Madri',
      program: 'Iberia Plus',
      airline: 'Iberia',
      date: '14 de nov. de 2026',
      miles: 42500,
      taxes: 615.00,
      locator: 'FLY892X',
      status: 'Confirmada'
    },
    {
      id: 'em-2',
      route: 'CGH → REC',
      city: 'Recife',
      program: 'Smiles (GOL)',
      airline: 'GOL Linhas Aéreas',
      date: '18 de nov. de 2026',
      miles: 14800,
      taxes: 54.90,
      locator: 'SMI442K',
      status: 'Confirmada'
    }
  ]);

  // Sub-View: Favoritos
  if (subView === 'favorites') {
    const currentList = favType === 'd' ? favoriteDestinations : favoriteOrigins;
    return (
      <div className="space-y-6 animate-fade-in pb-16">
        <button
          type="button"
          onClick={() => setSubView('main')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#9d98b0] hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar ao Perfil</span>
        </button>

        <div>
          <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#9d98b0] block mb-1">
            Salvos
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight text-white leading-tight">
            Seus <span className="text-[#34d399]">favoritos</span>
          </h1>
          <p className="text-sm text-[#9d98b0] mt-1 leading-relaxed">
            Salve cidades e aeroportos para acompanhar as ofertas mais rápido.
          </p>
        </div>

        {/* Toggle Destinos vs Origens */}
        <div className="grid grid-cols-2 gap-1.5 p-1 rounded-2xl bg-[#181328] border border-white/10">
          <button
            type="button"
            onClick={() => setFavType('d')}
            className={`py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              favType === 'd' ? 'bg-gradient-to-r from-[#3ee6a8] to-[#2fd08a] text-[#08060f] shadow-sm' : 'text-[#9d98b0] hover:text-white'
            }`}
          >
            Destinos salvos
          </button>
          <button
            type="button"
            onClick={() => setFavType('o')}
            className={`py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              favType === 'o' ? 'bg-gradient-to-r from-[#3ee6a8] to-[#2fd08a] text-[#08060f] shadow-sm' : 'text-[#9d98b0] hover:text-white'
            }`}
          >
            Origens
          </button>
        </div>

        {/* Add Input */}
        <div className="p-4 rounded-2xl bg-[#110d1d] border border-white/10 space-y-3">
          <div className="flex items-center gap-3 bg-[#181328] border border-white/15 focus-within:border-[#8b7cf6] rounded-2xl px-4 py-2.5 transition-colors">
            <MapPin className="w-4 h-4 text-[#8b7cf6] shrink-0" />
            <input
              type="text"
              value={newFavAirport}
              onChange={e => setNewFavAirport(e.target.value.toUpperCase())}
              placeholder="Código IATA (ex: REC, MAD, MIA, FLN)"
              className="w-full bg-transparent text-white font-bold text-sm outline-none"
            />
          </div>
          <button
            type="button"
            onClick={handleAddFavorite}
            className="w-full min-h-[46px] rounded-xl bg-gradient-to-r from-[#3ee6a8] to-[#2fd08a] hover:from-[#34d399] hover:to-[#22c55e] text-[#08060f] font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Adicionar {favType === 'd' ? 'destino' : 'origem'} favorito</span>
          </button>
        </div>

        {/* List */}
        <div className="space-y-2">
          {currentList.map(code => (
            <div
              key={code}
              className="flex items-center justify-between p-3.5 rounded-2xl bg-[#110d1d] border border-white/8 hover:border-white/15 transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl overflow-hidden relative shrink-0 border border-white/10 shadow-sm">
                  <img
                    src={getDestinationImageUrl(code)}
                    alt={code}
                    loading="lazy"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white font-mono font-black text-xs">
                    {code}
                  </div>
                </div>
                <div>
                  <span className="text-sm font-bold text-white block">Aeroporto {code}</span>
                  <span className="text-[11px] text-[#9d98b0] block">Toque para ver no radar</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleRemoveFavorite(code)}
                className="w-8 h-8 rounded-lg text-rose-400 hover:bg-rose-500/10 flex items-center justify-center transition-colors cursor-pointer"
                title="Remover"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Sub-View: Minhas Emissões
  if (subView === 'emissions') {
    return (
      <div className="space-y-6 animate-fade-in pb-16">
        <button
          type="button"
          onClick={() => setSubView('main')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#9d98b0] hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar ao Perfil</span>
        </button>

        <div>
          <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#9d98b0] block mb-1">
            Minhas viagens
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight text-white leading-tight">
            Minhas <span className="text-[#34d399]">emissões</span>
          </h1>
          <p className="text-sm text-[#9d98b0] mt-1 leading-relaxed">
            Acompanhe as emissões realizadas com sucesso através dos alertas e radar.
          </p>
        </div>

        <div className="space-y-3">
          {emissions.map(em => (
            <div
              key={em.id}
              className="p-5 rounded-2xl bg-[#110d1d] border border-white/10 shadow-md space-y-3"
            >
              <div className="flex items-center justify-between text-xs pb-2 border-b border-white/8">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#34d399]">
                  {em.program} · {em.airline}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#34d399]/15 text-[#6ee7b7] border border-[#34d399]/30">
                  {em.status}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <strong className="text-xl font-black text-white font-mono block">
                    {em.route}
                  </strong>
                  <span className="text-xs text-[#9d98b0] block">
                    {em.city} · {em.date}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-lg font-black text-[#6ee7b7] font-mono tabular-nums block">
                    {em.miles.toLocaleString('pt-BR')} milhas
                  </span>
                  <small className="text-[10px] text-[#9d98b0] block">
                    + R$ {em.taxes.toFixed(2)} taxas
                  </small>
                </div>
              </div>

              <div className="pt-2 border-t border-white/6 flex items-center justify-between text-xs text-[#9d98b0]">
                <span>Localizador: <strong className="text-white font-mono">{em.locator}</strong></span>
                <span className="text-[#8b7cf6] font-semibold flex items-center gap-1 cursor-pointer hover:underline">
                  Ver comprovante <ExternalLink className="w-3 h-3" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Sub-View: Dados e Preferências (Conta)
  if (subView === 'account') {
    return (
      <div className="space-y-6 animate-fade-in pb-16">
        <button
          type="button"
          onClick={() => setSubView('main')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#9d98b0] hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar ao Perfil</span>
        </button>

        <div>
          <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#9d98b0] block mb-1">
            Minha conta
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight text-white leading-tight">
            Dados e <span className="text-[#34d399]">preferências</span>
          </h1>
          <p className="text-sm text-[#9d98b0] mt-1 leading-relaxed">
            Configure seu nome de passageiro, contatos para alertas e preferências de voo.
          </p>
        </div>

        <form onSubmit={handleSaveAccount} className="p-5 sm:p-6 rounded-[22px] bg-[#110d1d] border border-white/10 space-y-4">
          <div>
            <label className="text-[10px] uppercase font-bold text-[#6f6a84] block mb-1.5">Nome do Titular</label>
            <div className="flex items-center gap-3 bg-[#181328] border border-white/15 focus-within:border-[#8b7cf6] rounded-2xl px-4 py-2.5 transition-colors">
              <User className="w-4 h-4 text-[#8b7cf6] shrink-0" />
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Seu nome completo"
                className="w-full bg-transparent text-white font-semibold text-sm outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] uppercase font-bold text-[#6f6a84] block mb-1.5">E-mail para Alertas</label>
            <div className="flex items-center gap-3 bg-[#181328] border border-white/15 focus-within:border-[#8b7cf6] rounded-2xl px-4 py-2.5 transition-colors">
              <User className="w-4 h-4 text-[#8b7cf6] shrink-0" />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="voce@email.com"
                className="w-full bg-transparent text-white font-semibold text-sm outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] uppercase font-bold text-[#6f6a84] block mb-1.5">Telefone / WhatsApp</label>
            <div className="flex items-center gap-3 bg-[#181328] border border-white/15 focus-within:border-[#8b7cf6] rounded-2xl px-4 py-2.5 transition-colors">
              <User className="w-4 h-4 text-[#8b7cf6] shrink-0" />
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="(11) 98765-4321"
                className="w-full bg-transparent text-white font-semibold text-sm outline-none"
              />
            </div>
          </div>

          <div className="pt-2">
            <h3 className="text-base font-bold text-white mb-2">Preferências de viagem</h3>
            <label className="text-[10px] uppercase font-bold text-[#6f6a84] block mb-1.5">Origem preferida</label>
            <div className="flex items-center gap-3 bg-[#181328] border border-white/15 focus-within:border-[#8b7cf6] rounded-2xl px-4 py-2.5 transition-colors mb-3">
              <MapPin className="w-4 h-4 text-[#8b7cf6] shrink-0" />
              <input
                type="text"
                value={preferredOrigin}
                onChange={e => setPreferredOrigin(e.target.value.toUpperCase())}
                placeholder="Ex: GRU, CGH, GIG"
                className="w-full bg-transparent text-white font-semibold text-sm outline-none"
              />
            </div>

            <label className="text-[10px] uppercase font-bold text-[#6f6a84] block mb-1.5">Classe preferida</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setPreferredCabin('Econômica')}
                className={`py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  preferredCabin === 'Econômica' ? 'bg-[#34d399]/20 text-[#6ee7b7] border border-[#34d399]/40' : 'bg-[#181328] text-[#9d98b0] border border-white/10'
                }`}
              >
                Econômica
              </button>
              <button
                type="button"
                onClick={() => setPreferredCabin('Executiva')}
                className={`py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  preferredCabin === 'Executiva' ? 'bg-[#34d399]/20 text-[#6ee7b7] border border-[#34d399]/40' : 'bg-[#181328] text-[#9d98b0] border border-white/10'
                }`}
              >
                Executiva
              </button>
            </div>
          </div>

          <div className="pt-2 border-t border-white/8">
            <div className="flex items-center justify-between text-xs py-1.5">
              <span className="text-[#9d98b0]">Plano atual:</span>
              <strong className="text-white font-bold">{user.plan === 'premium' ? 'Plano VIP' : 'Plano Gratuito'}</strong>
            </div>
          </div>

          {savedSuccess && (
            <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
              <Check className="w-4 h-4 shrink-0" />
              <span>Preferências atualizadas com sucesso!</span>
            </div>
          )}

          <button
            type="submit"
            className="w-full min-h-[48px] rounded-xl bg-gradient-to-r from-[#3ee6a8] to-[#2fd08a] hover:from-[#34d399] hover:to-[#22c55e] text-[#08060f] font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer"
          >
            <Check className="w-4 h-4 stroke-[2.5]" />
            <span>Salvar preferências</span>
          </button>
        </form>
      </div>
    );
  }

  // Main View: v-perfil
  return (
    <div className="space-y-6 animate-fade-in pb-16">
      {/* Header */}
      <div>
        <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#9d98b0] block mb-1">
          Minha conta
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
          Seu <span className="text-[#34d399]">perfil</span>
        </h1>
      </div>

      {/* User Card (Mockup .card) */}
      <div className="p-5 rounded-[22px] bg-[#110d1d] border border-white/10 flex items-center justify-between gap-4 shadow-md">
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="w-13 h-13 rounded-full bg-[#181328] border border-white/15 flex items-center justify-center text-white font-extrabold text-base tracking-tight shrink-0 shadow-inner">
            {user.displayName ? user.displayName.slice(0, 2).toUpperCase() : 'IM'}
          </div>
          <div className="min-w-0">
            <strong className="text-base font-bold text-white block truncate">
              {user.plan === 'premium' ? 'Plano VIP' : 'Plano Gratuito'}
            </strong>
            <small className="text-xs text-[#9d98b0] block truncate">
              {user.plan === 'premium' ? 'Acesso ilimitado a alertas e radar' : 'Faça upgrade para liberar alertas no WhatsApp'}
            </small>
          </div>
        </div>
        <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#8b7cf6]/20 text-[#c9c4f5] border border-white/15 shrink-0">
          Atual
        </span>
      </div>

      {/* Navigation List (.mn buttons from mockup) */}
      <div className="space-y-2">
        <button
          type="button"
          onClick={onOpenUpgrade}
          className="w-full flex items-center justify-between p-3.5 sm:p-4 rounded-2xl bg-[#110d1d] hover:bg-[#151024] border border-white/8 hover:border-[#8b7cf6]/40 transition-all text-left group cursor-pointer shadow-sm"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#8b7cf6]/10 border border-[#8b7cf6]/30 flex items-center justify-center text-[#8b7cf6] shrink-0">
              <Star className="w-5 h-5" />
            </div>
            <div>
              <strong className="text-sm font-bold text-white block">Meu plano</strong>
              <small className="text-xs text-[#9d98b0] block">Gratuito · ver planos e fazer upgrade</small>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-[#6f6a84] group-hover:text-white transition-colors" />
        </button>

        <button
          type="button"
          onClick={() => onNavigate('wallet')}
          className="w-full flex items-center justify-between p-3.5 sm:p-4 rounded-2xl bg-[#110d1d] hover:bg-[#151024] border border-white/8 hover:border-[#34d399]/40 transition-all text-left group cursor-pointer shadow-sm"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#34d399]/10 border border-[#34d399]/30 flex items-center justify-center text-[#34d399] shrink-0">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <strong className="text-sm font-bold text-white block">Carteira de milhas</strong>
              <small className="text-xs text-[#9d98b0] block">Gerenciar saldos e programas conectados</small>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-[#6f6a84] group-hover:text-white transition-colors" />
        </button>

        <button
          type="button"
          onClick={() => setSubView('favorites')}
          className="w-full flex items-center justify-between p-3.5 sm:p-4 rounded-2xl bg-[#110d1d] hover:bg-[#151024] border border-white/8 hover:border-[#5eb8ff]/40 transition-all text-left group cursor-pointer shadow-sm"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#5eb8ff]/10 border border-[#5eb8ff]/30 flex items-center justify-center text-[#5eb8ff] shrink-0">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <strong className="text-sm font-bold text-white block">Favoritos</strong>
              <small className="text-xs text-[#9d98b0] block">Destinos e origens salvos para monitoramento</small>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-[#6f6a84] group-hover:text-white transition-colors" />
        </button>

        <button
          type="button"
          onClick={() => setSubView('emissions')}
          className="w-full flex items-center justify-between p-3.5 sm:p-4 rounded-2xl bg-[#110d1d] hover:bg-[#151024] border border-white/8 hover:border-[#34d399]/40 transition-all text-left group cursor-pointer shadow-sm"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#34d399]/10 border border-[#34d399]/30 flex items-center justify-center text-[#34d399] shrink-0">
              <Tag className="w-5 h-5" />
            </div>
            <div>
              <strong className="text-sm font-bold text-white block">Minhas emissões</strong>
              <small className="text-xs text-[#9d98b0] block">Reservas e comprovantes emitidos</small>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-[#6f6a84] group-hover:text-white transition-colors" />
        </button>

        <button
          type="button"
          onClick={() => setSubView('account')}
          className="w-full flex items-center justify-between p-3.5 sm:p-4 rounded-2xl bg-[#110d1d] hover:bg-[#151024] border border-white/8 hover:border-white/20 transition-all text-left group cursor-pointer shadow-sm"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 shrink-0">
              <User className="w-5 h-5" />
            </div>
            <div>
              <strong className="text-sm font-bold text-white block">Dados e preferências</strong>
              <small className="text-xs text-[#9d98b0] block">Nome, contato e origem preferida</small>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-[#6f6a84] group-hover:text-white transition-colors" />
        </button>

        <button
          type="button"
          onClick={() => onNavigate('alerts')}
          className="w-full flex items-center justify-between p-3.5 sm:p-4 rounded-2xl bg-[#110d1d] hover:bg-[#151024] border border-white/8 hover:border-[#8b7cf6]/40 transition-all text-left group cursor-pointer shadow-sm"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#8b7cf6]/10 border border-[#8b7cf6]/30 flex items-center justify-center text-[#8b7cf6] shrink-0">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <strong className="text-sm font-bold text-white block">Alertas de preço</strong>
              <small className="text-xs text-[#9d98b0] block">Gerencie seus alertas ativos</small>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-[#6f6a84] group-hover:text-white transition-colors" />
        </button>

        <button
          type="button"
          onClick={onOpenUpgrade}
          className="w-full flex items-center justify-between p-3.5 sm:p-4 rounded-2xl bg-[#110d1d] hover:bg-[#151024] border border-white/8 hover:border-amber-400/40 transition-all text-left group cursor-pointer shadow-sm"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#f5b84b]/10 border border-[#f5b84b]/30 flex items-center justify-center text-[#f5b84b] shrink-0">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <strong className="text-sm font-bold text-white block">Alertas no WhatsApp</strong>
              <small className="text-xs text-[#f5b84b] block">Exclusivo no Plano VIP</small>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-[#6f6a84] group-hover:text-white transition-colors" />
        </button>

        <button
          type="button"
          className="w-full flex items-center justify-between p-3.5 sm:p-4 rounded-2xl bg-[#110d1d] hover:bg-[#151024] border border-white/8 hover:border-white/20 transition-all text-left group cursor-pointer shadow-sm"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 shrink-0">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <strong className="text-sm font-bold text-white block">Ajuda e suporte</strong>
              <small className="text-xs text-[#9d98b0] block">Perguntas frequentes e contato</small>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-[#6f6a84] group-hover:text-white transition-colors" />
        </button>

        <button
          type="button"
          onClick={onOpenAuth}
          className="w-full flex items-center justify-between p-3.5 sm:p-4 rounded-2xl bg-[#110d1d] hover:bg-rose-500/10 border border-white/8 hover:border-rose-500/30 transition-all text-left group cursor-pointer shadow-sm"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0">
              <LogOut className="w-5 h-5" />
            </div>
            <div>
              <strong className="text-sm font-bold text-rose-400 block">Sair da conta</strong>
              <small className="text-xs text-rose-300/70 block">Desconectar deste dispositivo</small>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-rose-400/50 group-hover:text-rose-400 transition-colors" />
        </button>
      </div>
    </div>
  );
};

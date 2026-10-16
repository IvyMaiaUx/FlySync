import React, { useState } from 'react';
import { useFlySync } from '../../store/FlySyncContext';
import { UserProfile } from '../../types';
import {
  Users,
  Search,
  Crown,
  ShieldCheck,
  Shield,
  Trash2,
  CheckCircle,
  XCircle,
  MoreVertical,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Sparkles,
  ArrowUpDown
} from 'lucide-react';

export const AdminUsersTab: React.FC = () => {
  const { users, adminUpdateUser, adminDeleteUser, user: currentAdmin } = useFlySync();
  const [searchTerm, setSearchTerm] = useState('');
  const [planFilter, setPlanFilter] = useState<'all' | 'free' | 'premium'>('all');
  const [roleFilter, setRoleFilter] = useState<'all' | 'user' | 'admin'>('all');
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);

  const filteredUsers = users.filter(u => {
    const matchesSearch =
      u.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPlan = planFilter === 'all' || u.plan === planFilter;
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesPlan && matchesRole;
  });

  const handleTogglePlan = (targetUser: UserProfile) => {
    const nextPlan = targetUser.plan === 'premium' ? 'free' : 'premium';
    adminUpdateUser(targetUser.id, { plan: nextPlan });
  };

  const handleToggleRole = (targetUser: UserProfile) => {
    if (targetUser.id === currentAdmin.id) {
      alert('Você não pode alterar seu próprio nível de administrador por segurança.');
      return;
    }
    const nextRole = targetUser.role === 'admin' ? 'user' : 'admin';
    adminUpdateUser(targetUser.id, { role: nextRole });
  };

  const handleDeleteUser = (targetUser: UserProfile) => {
    if (targetUser.id === currentAdmin.id) {
      alert('Você não pode excluir sua própria conta enquanto estiver logado.');
      return;
    }
    if (confirm(`Tem certeza que deseja excluir o usuário "${targetUser.displayName}" (${targetUser.email})?`)) {
      adminDeleteUser(targetUser.id);
      if (selectedUser?.id === targetUser.id) {
        setSelectedUser(null);
      }
    }
  };

  const vipCount = users.filter(u => u.plan === 'premium').length;
  const adminCount = users.filter(u => u.role === 'admin').length;

  return (
    <div className="space-y-6">
      {/* Header & Filter Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Users className="w-4 h-4 text-amber-400" />
            <span>Gestão de Usuários & Assinaturas</span>
          </h3>
          <p className="text-xs text-purple-300">
            Gerencie permissões de acesso, atribua planos VIP Pro e monitore preferências de alerta.
          </p>
        </div>

        {/* Quick summary badges */}
        <div className="flex items-center gap-2 text-xs">
          <span className="px-3 py-1 rounded-lg bg-purple-900/40 border border-purple-800 text-purple-200">
            Total: <strong className="text-white">{users.length}</strong>
          </span>
          <span className="px-3 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-semibold">
            VIP Pro: <strong className="text-white">{vipCount}</strong>
          </span>
          <span className="px-3 py-1 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-300 font-semibold">
            Admins: <strong className="text-white">{adminCount}</strong>
          </span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-2xl bg-[#12052C] border border-purple-900/70 shadow-lg flex flex-col sm:flex-row gap-3 items-center justify-between">
        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-purple-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nome ou e-mail..."
            className="w-full pl-9 pr-3 py-2 bg-[#180a33] border border-purple-800 rounded-xl text-xs text-white placeholder-purple-400/60 focus:outline-hidden focus:ring-2 focus:ring-amber-400/50"
          />
        </div>

        {/* Filter Buttons */}
        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto text-xs">
          {/* Plan Filter */}
          <div className="flex items-center bg-[#180a33] p-1 rounded-xl border border-purple-800">
            <button
              onClick={() => setPlanFilter('all')}
              className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                planFilter === 'all' ? 'bg-purple-800 text-white' : 'text-purple-300 hover:text-white'
              }`}
            >
              Todos os Planos
            </button>
            <button
              onClick={() => setPlanFilter('premium')}
              className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                planFilter === 'premium' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-purple-300 hover:text-white'
              }`}
            >
              VIP Pro
            </button>
            <button
              onClick={() => setPlanFilter('free')}
              className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                planFilter === 'free' ? 'bg-purple-800 text-white' : 'text-purple-300 hover:text-white'
              }`}
            >
              Gratuito
            </button>
          </div>

          {/* Role Filter */}
          <div className="flex items-center bg-[#180a33] p-1 rounded-xl border border-purple-800">
            <button
              onClick={() => setRoleFilter('all')}
              className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                roleFilter === 'all' ? 'bg-purple-800 text-white' : 'text-purple-300 hover:text-white'
              }`}
            >
              Todos os Papéis
            </button>
            <button
              onClick={() => setRoleFilter('admin')}
              className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                roleFilter === 'admin' ? 'bg-amber-400 text-slate-950 font-bold' : 'text-purple-300 hover:text-white'
              }`}
            >
              Admins
            </button>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="p-5 rounded-2xl bg-[#12052C] border border-purple-900/70 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-purple-900/60 text-purple-300 font-semibold uppercase text-[10px]">
                <th className="py-2.5 px-3">Usuário</th>
                <th className="py-2.5 px-3">Plano</th>
                <th className="py-2.5 px-3">Papel</th>
                <th className="py-2.5 px-3">Origem & Destinos</th>
                <th className="py-2.5 px-3">Cadastrado em</th>
                <th className="py-2.5 px-3 text-right">Ações Rápidas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-purple-900/40">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-purple-400">
                    Nenhum usuário encontrado com os filtros selecionados.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const isVIP = u.plan === 'premium';
                  const isAdmin = u.role === 'admin';
                  const favCount = u.preferences?.favoriteDestinations?.length || 0;

                  return (
                    <tr
                      key={u.id}
                      className="hover:bg-purple-900/20 transition-colors cursor-pointer"
                      onClick={() => setSelectedUser(u)}
                    >
                      {/* Name & Avatar */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-800 to-[#22C55E] flex items-center justify-center font-bold text-slate-950 text-xs shrink-0 shadow-xs">
                            {u.displayName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <span className="font-bold text-white block hover:text-amber-300 transition-colors">
                              {u.displayName}
                            </span>
                            <span className="text-[11px] text-purple-300/80 font-mono block">
                              {u.email}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Plan Badge */}
                      <td className="py-3 px-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            isVIP
                              ? 'bg-emerald-500/15 border border-emerald-500/40 text-emerald-300'
                              : 'bg-purple-900/40 border border-purple-800 text-purple-300'
                          }`}
                        >
                          {isVIP && <Crown className="w-3 h-3 text-emerald-400" />}
                          <span>{isVIP ? 'VIP Pro' : 'Gratuito'}</span>
                        </span>
                      </td>

                      {/* Role Badge */}
                      <td className="py-3 px-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold ${
                            isAdmin
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                              : 'bg-slate-800 text-slate-300 border border-slate-700'
                          }`}
                        >
                          {isAdmin ? <ShieldCheck className="w-3 h-3 text-amber-400" /> : <Shield className="w-3 h-3 text-slate-400" />}
                          <span>{isAdmin ? 'Admin' : 'Passageiro'}</span>
                        </span>
                      </td>

                      {/* Preferences */}
                      <td className="py-3 px-3">
                        <div className="text-slate-300">
                          <span className="font-mono font-bold text-white">
                            {u.preferences?.preferredOrigin || 'GRU'}
                          </span>
                          <span className="text-purple-400 text-[11px] ml-1.5">
                            ({favCount} favoritos)
                          </span>
                        </div>
                      </td>

                      {/* Created At */}
                      <td className="py-3 px-3 text-purple-300 font-mono text-[11px]">
                        {new Date(u.createdAt).toLocaleDateString('pt-BR')}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-3 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Toggle VIP */}
                          <button
                            onClick={() => handleTogglePlan(u)}
                            className={`p-1.5 rounded-lg text-xs font-semibold transition-all ${
                              isVIP
                                ? 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : 'bg-purple-900/40 hover:bg-purple-800 text-purple-300 border border-purple-800'
                            }`}
                            title={isVIP ? 'Rebaixar para Plano Gratuito' : 'Promover para VIP Pro'}
                          >
                            <Crown className={`w-3.5 h-3.5 ${isVIP ? 'text-emerald-400 fill-emerald-400/20' : ''}`} />
                          </button>

                          {/* Toggle Role */}
                          <button
                            onClick={() => handleToggleRole(u)}
                            className={`p-1.5 rounded-lg text-xs font-semibold transition-all ${
                              isAdmin
                                ? 'bg-amber-500/15 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40'
                                : 'bg-purple-900/40 hover:bg-purple-800 text-purple-300 border border-purple-800'
                            }`}
                            title={isAdmin ? 'Tornar Usuário Comum' : 'Promover a Administrador'}
                          >
                            <ShieldCheck className={`w-3.5 h-3.5 ${isAdmin ? 'text-amber-400' : ''}`} />
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => handleDeleteUser(u)}
                            className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/20 border border-rose-500/30 transition-all"
                            title="Excluir Usuário"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Details Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#12052C] border border-purple-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-800 to-[#22C55E] flex items-center justify-center text-slate-950 font-black text-lg">
                  {selectedUser.displayName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h4 className="text-base font-bold text-white">{selectedUser.displayName}</h4>
                  <p className="text-xs text-purple-300 font-mono">{selectedUser.email}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedUser(null)}
                className="text-purple-400 hover:text-white p-1 rounded-lg"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 p-4 rounded-xl bg-[#180a33] border border-purple-900/60 text-xs">
              <div>
                <span className="text-purple-400 block mb-0.5">Plano Ativo</span>
                <strong className={`font-bold ${selectedUser.plan === 'premium' ? 'text-emerald-400' : 'text-slate-300'}`}>
                  {selectedUser.plan === 'premium' ? 'VIP Pro (Assinante)' : 'Gratuito (Free)'}
                </strong>
              </div>
              <div>
                <span className="text-purple-400 block mb-0.5">Papel no Sistema</span>
                <strong className={`font-bold ${selectedUser.role === 'admin' ? 'text-amber-300' : 'text-slate-300'}`}>
                  {selectedUser.role === 'admin' ? 'Administrador do FlySync' : 'Passageiro'}
                </strong>
              </div>
              <div>
                <span className="text-purple-400 block mb-0.5">Origem Preferida</span>
                <strong className="text-white font-mono">{selectedUser.preferences?.preferredOrigin || 'GRU'}</strong>
              </div>
              <div>
                <span className="text-purple-400 block mb-0.5">Telefone / WhatsApp</span>
                <strong className="text-white font-mono">{selectedUser.preferences?.phone || 'Não informado'}</strong>
              </div>
            </div>

            {/* Favorite Destinations */}
            <div>
              <span className="text-xs font-bold text-purple-300 block mb-1.5">
                Destinos Monitorados:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {selectedUser.preferences?.favoriteDestinations && selectedUser.preferences.favoriteDestinations.length > 0 ? (
                  selectedUser.preferences.favoriteDestinations.map((code) => (
                    <span
                      key={code}
                      className="px-2.5 py-1 bg-purple-950 border border-purple-800 text-white rounded-lg text-xs font-mono font-bold"
                    >
                      {code}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-purple-400">Nenhum destino salvo ainda.</span>
                )}
              </div>
            </div>

            {/* Actions in modal */}
            <div className="flex items-center gap-3 pt-3 border-t border-purple-900/60">
              <button
                onClick={() => {
                  handleTogglePlan(selectedUser);
                  setSelectedUser(prev => prev ? { ...prev, plan: prev.plan === 'premium' ? 'free' : 'premium' } : null);
                }}
                className="flex-1 py-2 rounded-xl bg-purple-900/60 hover:bg-purple-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <Crown className="w-3.5 h-3.5 text-amber-400" />
                <span>{selectedUser.plan === 'premium' ? 'Rebaixar para Free' : 'Ativar VIP Pro'}</span>
              </button>

              <button
                onClick={() => setSelectedUser(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

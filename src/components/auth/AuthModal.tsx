import React, { useState } from 'react';
import { useFlySync } from '../../store/FlySyncContext';
import { Modal } from '../common/Modal';
import { User, Mail, Lock, Shield, Trash2, LogOut, Check, AlertCircle, Sparkles, Loader2, ArrowRight } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const {
    user,
    isAuthenticated,
    signIn,
    signUp,
    signOut,
    updatePreferences,
    setUser,
    deleteAccount
  } = useFlySync();

  // Mode for unauthenticated users: 'login' | 'register'
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  
  // Tabs for authenticated users: 'profile' | 'security'
  const [activeTab, setActiveTab] = useState<'profile' | 'security'>('profile');

  // Form states
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [nameInput, setNameInput] = useState(user.displayName);
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Login handler
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setFeedback(null);

    const res = await signIn(emailInput, passwordInput);
    setIsLoading(false);

    if (res.success) {
      setFeedback({ text: 'Login realizado com sucesso!', type: 'success' });
      setTimeout(() => {
        setFeedback(null);
        onClose();
      }, 1000);
    } else {
      setFeedback({ text: res.error || 'Erro ao realizar login.', type: 'error' });
    }
  };

  // Sign up handler
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setFeedback(null);

    const res = await signUp(emailInput, passwordInput, nameInput);
    setIsLoading(false);

    if (res.success) {
      setFeedback({
        text: res.message || 'Conta criada com sucesso! Você já está conectado.',
        type: 'success'
      });
      setTimeout(() => {
        setFeedback(null);
        onClose();
      }, 1500);
    } else {
      setFeedback({ text: res.error || 'Erro ao criar conta.', type: 'error' });
    }
  };

  // Profile save handler
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setUser(prev => ({
      ...prev,
      displayName: nameInput.trim() || prev.displayName
    }));
    setFeedback({ text: 'Perfil atualizado com sucesso.', type: 'success' });
    setTimeout(() => setFeedback(null), 2000);
  };

  // Logout handler
  const handleLogout = async () => {
    await signOut();
    onClose();
  };

  // Delete account handler
  const handleDeleteAccountAction = async () => {
    setIsLoading(true);
    await deleteAccount();
    setIsLoading(false);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isAuthenticated ? 'Gerenciamento de Conta & Perfil' : 'Acesse sua Conta FlySync'}
      subtitle={
        isAuthenticated
          ? 'Controle sua sessão, plano de assinatura e preferências LGPD.'
          : 'Faça login com seu e-mail ou crie uma conta para sincronizar alertas e milhas no Supabase.'
      }
    >
      <div className="space-y-4 text-white">
        {feedback && (
          <div
            className={`p-3 text-xs rounded-xl border flex items-center gap-2 ${
              feedback.type === 'success'
                ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/50'
                : 'bg-rose-950/80 text-rose-300 border-rose-500/50'
            }`}
          >
            {feedback.type === 'success' ? (
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <span>{feedback.text}</span>
          </div>
        )}

        {!isAuthenticated ? (
          /* Não Autenticado: Login ou Cadastro Real no Supabase */
          <div className="space-y-4">
            <div className="flex border-b border-purple-900/60 text-xs">
              <button
                type="button"
                onClick={() => {
                  setAuthMode('login');
                  setFeedback(null);
                }}
                className={`py-2.5 px-4 font-semibold border-b-2 transition-colors ${
                  authMode === 'login'
                    ? 'border-[#22C55E] text-[#22C55E]'
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                Entrar com E-mail
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMode('register');
                  setFeedback(null);
                }}
                className={`py-2.5 px-4 font-semibold border-b-2 transition-colors ${
                  authMode === 'register'
                    ? 'border-[#22C55E] text-[#22C55E]'
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                Criar Nova Conta
              </button>
            </div>

            <form onSubmit={authMode === 'login' ? handleLogin : handleRegister} className="space-y-3 text-xs">
              {authMode === 'register' && (
                <div>
                  <label className="block font-semibold text-purple-200 mb-1">Seu Nome</label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3 top-2.5 text-purple-400" />
                    <input
                      type="text"
                      placeholder="Ex: Isabelle Maia"
                      value={nameInput}
                      onChange={(e) => setNameInput(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 border border-purple-800 rounded-xl bg-[#180A38] text-white focus:ring-2 focus:ring-[#22C55E] focus:outline-hidden"
                      required
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block font-semibold text-purple-200 mb-1">E-mail</label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-2.5 text-purple-400" />
                  <input
                    type="email"
                    placeholder="seuemail@exemplo.com"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-purple-800 rounded-xl bg-[#180A38] text-white focus:ring-2 focus:ring-[#22C55E] focus:outline-hidden"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-purple-200 mb-1">Senha</label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-2.5 text-purple-400" />
                  <input
                    type="password"
                    placeholder="Pelo menos 6 caracteres"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-purple-800 rounded-xl bg-[#180A38] text-white focus:ring-2 focus:ring-[#22C55E] focus:outline-hidden"
                    minLength={6}
                    required
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 px-4 font-bold text-slate-950 bg-[#22C55E] hover:bg-emerald-400 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Processando...</span>
                    </>
                  ) : authMode === 'login' ? (
                    <>
                      <span>Entrar no FlySync</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  ) : (
                    <>
                      <span>Cadastrar Gratuitamente</span>
                      <Sparkles className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* Usuário Autenticado: Perfil Real e Segurança LGPD */
          <div className="space-y-4">
            <div className="flex border-b border-purple-900/60 text-xs">
              <button
                type="button"
                onClick={() => setActiveTab('profile')}
                className={`py-2 px-3 font-semibold border-b-2 transition-colors ${
                  activeTab === 'profile'
                    ? 'border-[#22C55E] text-[#22C55E]'
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                Perfil & Assinatura
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('security')}
                className={`py-2 px-3 font-semibold border-b-2 transition-colors ${
                  activeTab === 'security'
                    ? 'border-[#22C55E] text-[#22C55E]'
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                Segurança & LGPD
              </button>
            </div>

            {activeTab === 'profile' && (
              <form onSubmit={handleSaveProfile} className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-purple-200 mb-1">Nome de Exibição</label>
                  <input
                    type="text"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    className="w-full px-3 py-2 border border-purple-800 rounded-xl bg-[#180A38] text-white focus:ring-2 focus:ring-[#22C55E] focus:outline-hidden"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-purple-200 mb-1">Endereço de E-mail (Supabase Auth)</label>
                  <input
                    type="email"
                    value={user.email}
                    disabled
                    className="w-full px-3 py-2 border border-purple-900 rounded-xl bg-purple-950/40 text-slate-400 cursor-not-allowed"
                  />
                </div>

                <div className="p-3 bg-purple-950/60 rounded-xl border border-purple-850 flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-white block">Papel e Permissões</span>
                    <span className="text-[11px] text-purple-300">
                      {user.role === 'admin' ? 'Administrador do Sistema (Acesso Completo)' : 'Viajante'}
                    </span>
                  </div>
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-sm ${
                    user.role === 'admin'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : 'bg-purple-900/60 text-purple-300'
                  }`}>
                    {user.role}
                  </span>
                </div>

                <div className="p-3 bg-purple-950/60 rounded-xl border border-purple-850 flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-white block">Status do Plano</span>
                    <span className="text-[11px] text-purple-300">
                      {user.plan === 'premium' ? 'FlySync Premium (15 buscas + alertas)' : 'Plano Gratuito (2 buscas salvas)'}
                    </span>
                  </div>
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-sm ${
                    user.plan === 'premium'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      : 'bg-purple-900/60 text-purple-300'
                  }`}>
                    {user.plan}
                  </span>
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="px-3.5 py-2 font-medium text-rose-300 hover:text-white bg-rose-950/30 hover:bg-rose-900/40 border border-rose-800/60 rounded-xl transition-colors flex items-center gap-1.5"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sair da Conta</span>
                  </button>

                  <button
                    type="submit"
                    className="px-4 py-2 font-bold text-slate-950 bg-[#22C55E] hover:bg-emerald-400 rounded-xl shadow-sm transition-colors"
                  >
                    Salvar Nome
                  </button>
                </div>
              </form>
            )}

            {activeTab === 'security' && (
              <div className="space-y-4 text-xs">
                <div className="p-3.5 bg-purple-950/60 border border-purple-800 rounded-xl space-y-1">
                  <strong className="text-white block flex items-center gap-1.5">
                    <Shield className="w-4 h-4 text-emerald-400" />
                    Princípios de Privacidade e LGPD
                  </strong>
                  <p className="text-purple-200/80 leading-relaxed text-[11px]">
                    Seus dados de saldos e buscas salvas são armazenados de forma criptografada e vinculados com segurança ao seu usuário no Supabase.
                  </p>
                </div>

                <div className="pt-2 border-t border-purple-900/60">
                  <h4 className="font-bold text-rose-400 mb-1">Exclusão de Conta</h4>
                  <p className="text-purple-300/80 mb-3 text-[11px]">
                    Ao excluir sua conta, seus saldos, buscas salvas e notificações serão removidos permanentemente do banco de dados.
                  </p>

                  {confirmDelete ? (
                    <div className="p-3 bg-rose-950/40 border border-rose-500/50 rounded-xl flex items-center justify-between gap-3">
                      <span className="text-rose-200 text-xs">Confirmar exclusão definitiva no Supabase?</span>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={handleDeleteAccountAction}
                          disabled={isLoading}
                          className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg text-xs"
                        >
                          Sim, Excluir
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmDelete(false)}
                          className="px-3 py-1 bg-purple-900 hover:bg-purple-800 text-white font-medium rounded-lg text-xs"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirmDelete(true)}
                      className="px-3 py-1.5 text-xs font-bold text-rose-400 bg-rose-950/30 hover:bg-rose-900/40 border border-rose-800/60 rounded-xl transition-colors flex items-center gap-1.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Excluir Minha Conta Permanentemente
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
};

import React, { useState, useEffect } from 'react';
import { useFlySync } from '../../store/FlySyncContext';
import { Modal } from '../common/Modal';
import { LoyaltyProgram, MileageBalance } from '../../types';

interface BalanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialBalance?: MileageBalance | null;
}

export const BalanceModal: React.FC<BalanceModalProps> = ({
  isOpen,
  onClose,
  initialBalance
}) => {
  const { programs, addOrUpdateBalance } = useFlySync();

  const [programId, setProgramId] = useState<string>('');
  const [balanceStr, setBalanceStr] = useState<string>('');
  const [hasExpiration, setHasExpiration] = useState<boolean>(true);
  const [expiresAt, setExpiresAt] = useState<string>('');
  const [accountNumber, setAccountNumber] = useState<string>('');
  const [note, setNote] = useState<string>('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (initialBalance) {
      setProgramId(initialBalance.programId);
      setBalanceStr(initialBalance.balance.toString());
      if (initialBalance.expiresAt) {
        setHasExpiration(true);
        // Format to YYYY-MM-DD
        setExpiresAt(initialBalance.expiresAt.split('T')[0]);
      } else {
        setHasExpiration(false);
        setExpiresAt('');
      }
      setAccountNumber(initialBalance.accountNumber || '');
      setNote(initialBalance.notes || '');
    } else {
      setProgramId(programs[0]?.id || '');
      setBalanceStr('');
      setHasExpiration(true);
      // default 6 months ahead
      const d = new Date();
      d.setMonth(d.getMonth() + 6);
      setExpiresAt(d.toISOString().split('T')[0]);
      setAccountNumber('');
      setNote('');
    }
    setError('');
  }, [initialBalance, isOpen, programs]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseInt(balanceStr.replace(/\D/g, ''), 10);
    if (isNaN(num) || num < 0) {
      setError('Por favor, informe uma quantidade válida de milhas ou pontos (>= 0).');
      return;
    }

    if (!programId) {
      setError('Selecione um programa de fidelidade.');
      return;
    }

    const expValue = hasExpiration && expiresAt ? `${expiresAt}T23:59:59Z` : null;

    addOrUpdateBalance(programId, num, expValue, accountNumber, note);
    onClose();
  };

  const selectedProgram = programs.find(p => p.id === programId);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialBalance ? 'Atualizar saldo' : 'Adicionar programa'}
      subtitle="Digite seu saldo. Não pedimos sua senha."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 text-red-700 text-xs rounded-lg border border-red-200">
            {error}
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Programa de Fidelidade
          </label>
          <select
            value={programId}
            onChange={(e) => setProgramId(e.target.value)}
            disabled={!!initialBalance}
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-900 focus:border-purple-900 bg-white"
          >
            {programs.map((prog) => (
              <option key={prog.id} value={prog.id}>
                {prog.name} ({prog.unitLabel}) · {prog.category === 'bank' ? 'Bancário' : 'Aéreo'}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Saldo Atual ({selectedProgram?.unitLabel || 'milhas'})
          </label>
          <div className="relative">
            <input
              type="text"
              value={balanceStr}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, '');
                setBalanceStr(val ? parseInt(val, 10).toLocaleString('pt-BR') : '');
              }}
              placeholder="Ex: 85.000"
              className="w-full px-3 py-2 text-sm font-mono tabular-nums border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-900 focus:border-purple-900"
              required
            />
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Informe exatamente o saldo disponível na sua conta oficial.
          </p>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-semibold text-slate-700">
              Data de Validade dos Pontos
            </label>
            <label className="text-xs text-slate-500 flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={!hasExpiration}
                onChange={(e) => setHasExpiration(!e.target.checked)}
                className="rounded-sm text-purple-900 focus:ring-purple-900"
              />
              Não expiram (Clube / VIP)
            </label>
          </div>
          {hasExpiration ? (
            <input
              type="date"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-900 focus:border-purple-900"
              required
            />
          ) : (
            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-500">
              Pontos configurados sem expiração automática (ex: Clube de Fidelidade ou cartão co-branded permanente).
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Número da Conta / CPF (Opcional)
            </label>
            <input
              type="text"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              placeholder="Apenas para sua referência"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-900 focus:border-purple-900"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Observação / Origem (Opcional)
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Ex: Fatura cartão, compra 10x"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-900 focus:border-purple-900"
            />
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-xs font-bold text-white bg-purple-950 hover:bg-purple-900 rounded-lg shadow-sm transition-colors"
          >
            {initialBalance ? 'Salvar Alterações' : 'Adicionar à Carteira'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

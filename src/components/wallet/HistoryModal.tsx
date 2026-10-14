import React from 'react';
import { Modal } from '../common/Modal';
import { BalanceHistory } from '../../types';
import { ArrowUpRight, ArrowDownRight, Minus, Clock } from 'lucide-react';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: BalanceHistory[];
  programFilter?: string;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({
  isOpen,
  onClose,
  history,
  programFilter
}) => {
  const filteredHistory = programFilter
    ? history.filter(h => h.programName === programFilter)
    : history;

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Histórico de Alterações de Saldo"
      subtitle={
        programFilter
          ? `Registro auditável de lançamentos para ${programFilter}.`
          : 'Linha do tempo consolidada de entradas, resgates e reconciliações manuais.'
      }
      maxWidth="max-w-2xl"
    >
      <div className="space-y-3">
        {filteredHistory.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-xs">
            Nenhuma alteração registrada ainda para este programa.
          </div>
        ) : (
          filteredHistory.map((item) => (
            <div
              key={item.id}
              className="p-3.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50/50 transition-colors flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    item.diff > 0
                      ? 'bg-emerald-50 text-emerald-700'
                      : item.diff < 0
                      ? 'bg-rose-50 text-rose-700'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {item.diff > 0 ? (
                    <ArrowUpRight className="w-4 h-4" />
                  ) : item.diff < 0 ? (
                    <ArrowDownRight className="w-4 h-4" />
                  ) : (
                    <Minus className="w-4 h-4" />
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">{item.programName}</span>
                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDate(item.recordedAt)}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">{item.note || 'Atualização manual'}</p>
                </div>
              </div>

              <div className="text-right shrink-0">
                <div
                  className={`text-xs font-bold font-mono tabular-nums ${
                    item.diff > 0
                      ? 'text-emerald-700'
                      : item.diff < 0
                      ? 'text-rose-700'
                      : 'text-slate-600'
                  }`}
                >
                  {item.diff > 0 ? `+${item.diff.toLocaleString('pt-BR')}` : item.diff < 0 ? item.diff.toLocaleString('pt-BR') : 'Sem alteração'}
                </div>
                <div className="text-[11px] text-slate-400 font-mono tabular-nums">
                  Saldo: {item.newBalance.toLocaleString('pt-BR')}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="mt-5 pt-3 border-t border-slate-100 flex justify-end">
        <button
          onClick={onClose}
          className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
        >
          Fechar
        </button>
      </div>
    </Modal>
  );
};

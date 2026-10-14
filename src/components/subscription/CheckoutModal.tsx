import React, { useState } from 'react';
import { useFlySync } from '../../store/FlySyncContext';
import { Modal } from '../common/Modal';
import { PLANS } from '../../data/initialData';
import {
  CreditCard,
  QrCode,
  ShieldCheck,
  CheckCircle2,
  Lock,
  ArrowRight,
  Sparkles,
  Crown,
  Copy,
  Check
} from 'lucide-react';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  interval: 'month' | 'year';
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  interval
}) => {
  const { simulateCheckout } = useFlySync();
  const [method, setMethod] = useState<'card' | 'pix'>('card');
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardHolder, setCardHolder] = useState('ISABELLE F');
  const [expiry, setExpiry] = useState('12/28');
  const [cvv, setCvv] = useState('889');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [copiedPix, setCopiedPix] = useState(false);

  const plan = PLANS.premium;
  const price = interval === 'month' ? plan.priceMonthly : plan.priceAnnual;

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      // Simulate real gateway latency and webhook confirmation
      await new Promise(resolve => setTimeout(resolve, 1400));
      await simulateCheckout('premium', interval, method);
      setIsProcessing(false);
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 2200);
    } catch {
      setIsProcessing(false);
    }
  };

  const handleCopyPix = () => {
    navigator.clipboard?.writeText('00020126580014br.gov.bcb.pix0136flysync-vip-subscription-key5204000053039865802BR5915FLYSYNC TEC6009SAO PAULO62070503***6304E8A2');
    setCopiedPix(true);
    setTimeout(() => setCopiedPix(false), 2000);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Desbloquear FlySync Premium"
      subtitle="Acesso imediato ao radar completo com alertas no WhatsApp"
      size="md"
    >
      {isSuccess ? (
        <div className="py-8 text-center space-y-4">
          <div className="w-16 h-16 bg-gradient-to-tr from-[#4ADE80] to-[#22C55E] text-slate-950 rounded-2xl flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(34,197,94,0.5)]">
            <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
          </div>
          <div>
            <h3 className="text-xl font-black text-white">Assinatura Ativada com Sucesso!</h3>
            <p className="text-xs text-purple-200/90 mt-1 max-w-sm mx-auto">
              Seu plano foi atualizado para <strong>FlySync Premium VIP</strong>. As 15 rotas e alertas instantâneos já estão disponíveis no seu painel.
            </p>
          </div>
        </div>
      ) : (
        <form onSubmit={handlePay} className="space-y-4 text-white">
          {/* Order Summary Elegante */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-[#1F0A44] to-[#12052B] border border-purple-700/60 flex items-center justify-between shadow-lg">
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5">
                <Crown className="w-3.5 h-3.5 text-amber-400" />
                <span className="font-bold text-white text-xs">
                  FlySync Premium ({interval === 'month' ? 'Mensal' : 'Anual - 22% OFF'})
                </span>
              </div>
              <span className="text-[11px] text-purple-300 block">
                {interval === 'year' ? 'Acesso ilimitado por 1 ano completo' : 'Assinatura flexível sem fidelidade'}
              </span>
            </div>
            <div className="text-right">
              <span className="text-lg font-black text-[#4ADE80] font-mono tabular-nums block">
                R$ {price.toFixed(2).replace('.', ',')}
              </span>
              <span className="text-[10px] text-slate-400">/{interval === 'month' ? 'mês' : 'ano'}</span>
            </div>
          </div>

          {/* Forma de Pagamento */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-purple-200">
              Forma de Pagamento
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setMethod('card')}
                className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  method === 'card'
                    ? 'border-emerald-500 bg-emerald-500/15 text-emerald-300 shadow-sm ring-1 ring-emerald-500/30'
                    : 'border-purple-900 bg-[#160833] text-slate-300 hover:text-white hover:bg-purple-900/40'
                }`}
              >
                <CreditCard className="w-4 h-4 text-emerald-400" />
                <span>Cartão de Crédito</span>
              </button>

              <button
                type="button"
                onClick={() => setMethod('pix')}
                className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  method === 'pix'
                    ? 'border-emerald-500 bg-emerald-500/15 text-emerald-300 shadow-sm ring-1 ring-emerald-500/30'
                    : 'border-purple-900 bg-[#160833] text-slate-300 hover:text-white hover:bg-purple-900/40'
                }`}
              >
                <QrCode className="w-4 h-4 text-[#38BDF8]" />
                <span>PIX Instantâneo</span>
              </button>
            </div>
          </div>

          {method === 'card' ? (
            <div className="space-y-3 pt-1">
              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">
                  Número do Cartão
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#160833] text-white text-xs font-mono border border-purple-800 rounded-xl focus:border-emerald-400 focus:outline-hidden transition-colors"
                    required
                  />
                  <CreditCard className="w-4 h-4 text-slate-400 absolute right-3.5 top-3 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">
                  Nome do Titular
                </label>
                <input
                  type="text"
                  value={cardHolder}
                  onChange={(e) => setCardHolder(e.target.value.toUpperCase())}
                  className="w-full px-3.5 py-2.5 bg-[#160833] text-white text-xs uppercase border border-purple-800 rounded-xl focus:border-emerald-400 focus:outline-hidden transition-colors"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">
                    Validade
                  </label>
                  <input
                    type="text"
                    value={expiry}
                    onChange={(e) => setExpiry(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#160833] text-white text-xs font-mono border border-purple-800 rounded-xl focus:border-emerald-400 focus:outline-hidden transition-colors"
                    placeholder="MM/AA"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">
                    CVV
                  </label>
                  <input
                    type="text"
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#160833] text-white text-xs font-mono border border-purple-800 rounded-xl focus:border-emerald-400 focus:outline-hidden transition-colors"
                    placeholder="123"
                    required
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-2xl border border-purple-800 bg-[#160833] text-center space-y-3">
              <div className="w-28 h-28 mx-auto bg-white rounded-xl flex items-center justify-center p-2 shadow-lg">
                <QrCode className="w-24 h-24 text-slate-900" />
              </div>
              <div>
                <p className="text-xs text-white font-bold">
                  Escaneie o QR Code ou copie o código PIX
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  A confirmação é automática em tempo real pelo Banco Central.
                </p>
              </div>

              <button
                type="button"
                onClick={handleCopyPix}
                className="w-full py-2 px-3 rounded-xl bg-purple-900/60 hover:bg-purple-900 border border-purple-700/60 text-xs font-bold text-purple-200 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                {copiedPix ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400 font-bold">Chave PIX Copiada!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copiar Código Copia e Cola</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* Garantia & Criptografia */}
          <div className="flex items-center gap-2 text-[11px] text-slate-300 pt-1">
            <Lock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>Pagamento seguro com criptografia bancária 256-bit e garantia incondicional de 7 dias.</span>
          </div>

          {/* Botões do Rodapé */}
          <div className="pt-3 border-t border-purple-900/60 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={isProcessing}
              className="px-4 py-2.5 text-xs font-bold text-slate-300 hover:text-white rounded-xl transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isProcessing}
              className="px-6 py-2.5 text-xs font-black text-slate-950 bg-gradient-to-r from-[#4ADE80] to-[#22C55E] hover:from-[#22C55E] hover:to-[#16A34A] rounded-xl shadow-[0_0_20px_rgba(34,197,94,0.35)] transition-all flex items-center gap-2 cursor-pointer transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {isProcessing ? 'Confirmando no gateway...' : `Confirmar Assinatura (R$ ${price.toFixed(2).replace('.', ',')})`}
              {!isProcessing && <ArrowRight className="w-3.5 h-3.5 stroke-[3]" />}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
};

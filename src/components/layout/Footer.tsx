import React, { useState } from 'react';
import { ShieldCheck, Lock, FileText, CheckCircle2 } from 'lucide-react';
import { FlySyncLogo } from '../common/FlySyncLogo';
import { Modal } from '../common/Modal';

export const Footer: React.FC = () => {
  const [legalModal, setLegalModal] = useState<'terms' | 'privacy' | null>(null);

  return (
    <footer className="mt-16 bg-[#0B0218] border-t border-purple-900/40 text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8 text-xs">
          {/* Column 1: Brand & Purpose */}
          <div className="md:col-span-2">
            <div className="mb-3">
              <FlySyncLogo size="md" isDarkTheme={true} />
            </div>
            <p className="text-slate-400 max-w-sm mb-4 leading-relaxed">
              Milhas sob controle. Oportunidades no radar. Gestão transparente e monitoramento contínuo de passagens com milhas aéreas e pontos bancários.
            </p>
            <div className="flex items-center gap-4 text-[11px] text-slate-400">
              <span className="flex items-center gap-1 text-[#22C55E]">
                <ShieldCheck className="w-3.5 h-3.5" />
                Segurança LGPD
              </span>
              <span>·</span>
              <span className="flex items-center gap-1 text-slate-400">
                <Lock className="w-3.5 h-3.5" />
                Sem custódia de senhas
              </span>
            </div>
          </div>

          {/* Column 2: Princípio do Produto */}
          <div>
            <h4 className="font-semibold text-white mb-2.5">Princípio FlySync</h4>
            <ul className="space-y-1.5 text-slate-400">
              <li>O FlySync informa e monitora</li>
              <li>Redirecionamento ao canal oficial</li>
              <li>Emissão e pagamento na companhia</li>
              <li>Saldos manuais e auditáveis</li>
            </ul>
          </div>

          {/* Column 3: Programas & Cobertura */}
          <div>
            <h4 className="font-semibold text-white mb-2.5">Programas Monitorados</h4>
            <ul className="space-y-1.5 text-slate-400">
              <li>Smiles (GOL Linhas Aéreas)</li>
              <li>LATAM Pass (LATAM Airlines)</li>
              <li>Azul Fidelidade & Azul Conecta</li>
              <li>TAP Miles&Go & Iberia Plus</li>
              <li>Livelo & Esfera Santander</li>
            </ul>
          </div>
        </div>

        {/* Disclaimer Bar */}
        <div className="pt-6 border-t border-purple-950 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-3">
          <p>
            © 2026 FlySync Tecnologia Ltda. Todos os direitos reservados. Marcas e logotipos pertencem às respectivas companhias aéreas e programas.
          </p>
          <div className="flex items-center gap-4 text-slate-400">
            <button
              type="button"
              onClick={() => setLegalModal('terms')}
              className="hover:text-[#22C55E] cursor-pointer transition-colors"
            >
              Termos de Uso
            </button>
            <span>·</span>
            <button
              type="button"
              onClick={() => setLegalModal('privacy')}
              className="hover:text-[#22C55E] cursor-pointer transition-colors"
            >
              Política de Privacidade
            </button>
            <span>·</span>
            <a href="#/admin" className="hover:text-amber-300 flex items-center gap-1 transition-colors text-slate-500 hover:underline">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400/80" />
              <span>Acesso Admin</span>
            </a>
          </div>
        </div>
      </div>

      {/* Modal: Termos de Uso */}
      <Modal
        isOpen={legalModal === 'terms'}
        onClose={() => setLegalModal(null)}
        title="Termos de Uso do FlySync"
        subtitle="Condições gerais de navegação, monitoramento e redirecionamento"
      >
        <div className="space-y-4 text-xs text-slate-300 leading-relaxed max-h-[70vh] overflow-y-auto pr-1">
          <div className="p-3 rounded-xl bg-purple-950/40 border border-purple-800/40 flex items-start gap-2.5">
            <FileText className="w-4 h-4 text-[#22C55E] shrink-0 mt-0.5" />
            <p className="text-slate-200">
              O <strong>FlySync</strong> atua exclusivamente como uma ferramenta de busca, comparação, monitoramento de tarifas e gestão patrimonial de milhas.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-white text-sm">1. Natureza Informativa e Sem Custódia</h4>
            <p>
              O FlySync não comercializa passagens aéreas, não emite bilhetes e não efetua cobrança de tarifas de voo. Ao clicar em emitir, o usuário é redirecionado aos portais e sistemas oficiais das companhias aéreas (Smiles, Latam Pass, Azul, TAP, Iberia, etc.), onde a compra é formalizada diretamente entre passageiro e transportadora.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-white text-sm">2. Disponibilidade e Assentos Dinâmicos</h4>
            <p>
              Tarifas promocionais em milhas possuem quantidade limitada de assentos e são dinâmicas. O FlySync verifica continuamente as rotas, contudo a confirmação final da reserva depende exclusivamente da disponibilidade no momento do acesso na companhia aérea.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-white text-sm">3. Responsabilidade do Usuário</h4>
            <p>
              O usuário é responsável por conferir regras de bagagem, validade de passaporte, vistos e exigências sanitárias antes de confirmar a emissão no site da companhia aérea parceira.
            </p>
          </div>

          <div className="pt-3 border-t border-purple-900/50 flex justify-end">
            <button
              type="button"
              onClick={() => setLegalModal(null)}
              className="px-4 py-2 rounded-xl bg-[#22C55E] text-slate-950 font-bold hover:bg-emerald-400 transition-colors cursor-pointer"
            >
              Compreendido
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal: Política de Privacidade e LGPD */}
      <Modal
        isOpen={legalModal === 'privacy'}
        onClose={() => setLegalModal(null)}
        title="Política de Privacidade & LGPD"
        subtitle="Compromisso rigoroso com a segurança dos seus dados"
      >
        <div className="space-y-4 text-xs text-slate-300 leading-relaxed max-h-[70vh] overflow-y-auto pr-1">
          <div className="p-3 rounded-xl bg-purple-950/40 border border-purple-800/40 flex items-start gap-2.5">
            <Lock className="w-4 h-4 text-[#22C55E] shrink-0 mt-0.5" />
            <p className="text-slate-200">
              Sua privacidade é prioridade máxima. O FlySync opera em conformidade total com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018 - LGPD).
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-white text-sm">1. Sem Custódia de Senhas ou Acessos Sensíveis</h4>
            <p>
              O FlySync <strong>NUNCA</strong> solicita, armazena ou possui acesso às suas senhas de companhias aéreas, contas bancárias ou programas de fidelidade. A gestão de saldos na carteira é feita de forma autônoma, transparente e auditável.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-white text-sm">2. Finalidade dos Dados Coletados</h4>
            <p>
              Os dados de perfil (nome, e-mail e preferências de rota) são utilizados unicamente para personalizar sua experiência e enviar os alertas de passagens baratas solicitados por você via Web Push, E-mail ou WhatsApp.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-white text-sm">3. Direitos do Titular (LGPD)</h4>
            <p>
              Você pode a qualquer momento consultar, retificar ou solicitar a exclusão integral de sua conta e histórico através das configurações de perfil.
            </p>
          </div>

          <div className="pt-3 border-t border-purple-900/50 flex justify-end">
            <button
              type="button"
              onClick={() => setLegalModal(null)}
              className="px-4 py-2 rounded-xl bg-[#22C55E] text-slate-950 font-bold hover:bg-emerald-400 transition-colors cursor-pointer"
            >
              Entendido
            </button>
          </div>
        </div>
      </Modal>
    </footer>
  );
};

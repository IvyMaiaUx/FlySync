import React from 'react';
import { ShieldCheck, Lock } from 'lucide-react';
import { FlySyncLogo } from '../common/FlySyncLogo';

export const Footer: React.FC = () => {
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
            <span className="hover:text-[#22C55E] cursor-pointer transition-colors">
              Termos de Uso
            </span>
            <span>·</span>
            <span className="hover:text-[#22C55E] cursor-pointer transition-colors">
              Política de Privacidade
            </span>
            <span>·</span>
            <a href="#/admin" className="hover:text-amber-300 flex items-center gap-1 transition-colors text-slate-500 hover:underline">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400/80" />
              <span>Acesso Admin</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

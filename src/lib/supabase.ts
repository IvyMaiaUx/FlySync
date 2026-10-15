import { createClient, SupabaseClient } from '@supabase/supabase-js';

const defaultUrl = 'https://kcbuuwftyoyqisltqcuh.supabase.co';
const defaultKey = 'sb_publishable_v6ZQ0_gJJsPKpfZQuFhO6A_7SiJENV-';

const envUrl = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.trim();
const envKey = (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined)?.trim();

const url = envUrl && envUrl.length > 10 ? envUrl : defaultUrl;
const key = envKey && envKey.length > 20 ? envKey : defaultKey;

/** true quando URL e chave são válidas */
export const isSupabaseConfigured = /^https:\/\/.+\.supabase\.co\/?$/.test(url) && key.length > 20;

// Quando não configurado, cria um cliente "vazio" só para não quebrar os imports;
// o App mostra a tela de configuração antes de qualquer chamada.
export const supabase: SupabaseClient = createClient(
  isSupabaseConfigured ? url : 'https://placeholder.supabase.co',
  isSupabaseConfigured ? key : 'placeholder-key-placeholder-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  }
);

/** Traduz os erros mais comuns do Supabase para mensagens amigáveis */
export const friendlyError = (err: unknown): string => {
  const msg = (err as { message?: string })?.message || String(err ?? '');
  if (/Invalid login credentials/i.test(msg)) return 'E-mail ou senha incorretos.';
  if (/Email not confirmed/i.test(msg)) return 'Confirme seu e-mail antes de entrar (veja sua caixa de entrada).';
  if (/User already registered/i.test(msg)) return 'Já existe uma conta com esse e-mail.';
  if (/Password should be at least/i.test(msg)) return 'A senha precisa ter pelo menos 6 caracteres.';
  if (/rate limit/i.test(msg)) return 'Muitas tentativas. Espere um pouco e tente de novo.';
  if (/Failed to fetch|NetworkError/i.test(msg)) return 'Sem conexão com o servidor. Verifique sua internet.';
  if (/row-level security/i.test(msg)) return 'Você não tem permissão para essa ação.';
  return msg || 'Algo deu errado. Tente novamente.';
};

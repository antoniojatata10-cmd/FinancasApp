import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Variáveis de ambiente do Supabase não encontradas. Verifique o ficheiro .env');
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder'
);

// ─── Storage helpers ──────────────────────────────────────────────────────────
export async function uploadComprovativo(file) {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Math.random().toString(36).slice(2, 15)}_${Date.now()}.${fileExt}`;
  const filePath = `receipts/${fileName}`;

  const { error } = await supabase.storage
    .from('comprovativos')
    .upload(filePath, file, { cacheControl: '3600', upsert: false });

  if (error) throw error;

  const { data: { publicUrl } } = supabase.storage
    .from('comprovativos')
    .getPublicUrl(filePath);

  return publicUrl;
}

export const isSupabaseConfigured = () => !!(supabaseUrl && supabaseAnonKey);

export function getSupabaseClient() {
  return supabase;
}

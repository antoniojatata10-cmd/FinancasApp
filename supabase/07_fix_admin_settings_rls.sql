-- ============================================================
-- Migration 07: Fix admin_settings RLS policy for admin writes
-- 
-- Problema:
--   A política "admin_settings_write" usava:
--     FOR ALL USING (public.is_admin())
--   sem WITH CHECK explícito. Em alguns contextos (nomeadamente
--   em upsert do Supabase que faz INSERT seguido de UPDATE em
--   caso de conflito), a cláusula WITH CHECK é necessária para
--   que a operação seja permitida.
--
--   Erro observado:
--     "new row violates row-level security policy for table admin_settings"
--
-- Correcção:
--   Recriar a política com WITH CHECK explícito, garantindo que
--   tanto a leitura da linha existente (USING) como a inserção/
--   actualização da nova linha (WITH CHECK) são validadas contra
--   a função public.is_admin().
-- ============================================================

-- Garantir que a função auxiliar existe (definida originalmente em 00_schema.sql)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- Remover política antiga (pode existir com qualquer nome)
DROP POLICY IF EXISTS "admin_settings_write" ON public.admin_settings;
DROP POLICY IF EXISTS "Admin settings are updatable by admins only" ON public.admin_settings;

-- Recriar com WITH CHECK explícito
CREATE POLICY "admin_settings_write" ON public.admin_settings
  FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

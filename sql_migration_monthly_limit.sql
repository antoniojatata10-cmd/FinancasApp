-- MIGRAÇÃO: Adicionar coluna monthly_limit à tabela categories
-- Executar no SQL Editor do Supabase Dashboard

ALTER TABLE public.categories
  ADD COLUMN IF NOT EXISTS monthly_limit numeric(15,2) NOT NULL DEFAULT 0 CHECK (monthly_limit >= 0);

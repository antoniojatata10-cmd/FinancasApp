-- ══════════════════════════════════════════════════════════════════════════════
-- MIGRATION: Adicionar coluna monthly_limit às categorias
-- Execute no SQL Editor do Supabase
-- ══════════════════════════════════════════════════════════════════════════════

-- Adicionar coluna monthly_limit à tabela categories
-- (só executa se a coluna ainda não existir)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'categories'
      AND column_name = 'monthly_limit'
  ) THEN
    ALTER TABLE public.categories
      ADD COLUMN monthly_limit numeric(15,2) NOT NULL DEFAULT 0 CHECK (monthly_limit >= 0);
    RAISE NOTICE 'Coluna monthly_limit adicionada com sucesso.';
  ELSE
    RAISE NOTICE 'Coluna monthly_limit já existe. Nenhuma alteração necessária.';
  END IF;
END $$;

-- =============================================
-- MIGRAÇÃO: Sistema de Cartões
-- Execute este SQL no Supabase SQL Editor
-- =============================================

-- 1. Criar tabela cards
CREATE TABLE IF NOT EXISTS cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  number TEXT,
  icon TEXT DEFAULT '💳',
  description TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Adicionar card_id em categories (se não existir)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'categories' AND column_name = 'card_id'
  ) THEN
    ALTER TABLE categories ADD COLUMN card_id UUID REFERENCES cards(id) ON DELETE SET NULL;
  END IF;
END $$;

-- 3. Adicionar card_id em transactions (se não existir)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'transactions' AND column_name = 'card_id'
  ) THEN
    ALTER TABLE transactions ADD COLUMN card_id UUID REFERENCES cards(id) ON DELETE SET NULL;
  END IF;
END $$;

-- 4. Criar tabela transfers
CREATE TABLE IF NOT EXISTS transfers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  from_card_id UUID REFERENCES cards(id) ON DELETE CASCADE NOT NULL,
  to_card_id UUID REFERENCES cards(id) ON DELETE CASCADE NOT NULL,
  amount NUMERIC NOT NULL CHECK (amount > 0),
  description TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Habilitar RLS em cards
ALTER TABLE cards ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own cards" ON cards;
CREATE POLICY "Users can view own cards"
  ON cards FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own cards" ON cards;
CREATE POLICY "Users can insert own cards"
  ON cards FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own cards" ON cards;
CREATE POLICY "Users can update own cards"
  ON cards FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own cards" ON cards;
CREATE POLICY "Users can delete own cards"
  ON cards FOR DELETE
  USING (auth.uid() = user_id);

-- Admin policies for cards
DROP POLICY IF EXISTS "Admins can view all cards" ON cards;
CREATE POLICY "Admins can view all cards"
  ON cards FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- 6. Habilitar RLS em transfers
ALTER TABLE transfers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own transfers" ON transfers;
CREATE POLICY "Users can view own transfers"
  ON transfers FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own transfers" ON transfers;
CREATE POLICY "Users can insert own transfers"
  ON transfers FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 7. Habilitar realtime para cards e transfers
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'cards'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE cards;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'transfers'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE transfers;
  END IF;
END $$;

-- 8. Trigger para updated_at em cards
CREATE OR REPLACE FUNCTION update_cards_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS cards_updated_at ON cards;
CREATE TRIGGER cards_updated_at
  BEFORE UPDATE ON cards
  FOR EACH ROW
  EXECUTE FUNCTION update_cards_updated_at();

-- 9. Adicionar colunas de personalização
ALTER TABLE cards ADD COLUMN IF NOT EXISTS color TEXT DEFAULT '#6366f1';
ALTER TABLE cards ADD COLUMN IF NOT EXISTS style TEXT DEFAULT 'modern';
ALTER TABLE cards ADD COLUMN IF NOT EXISTS model TEXT DEFAULT 'classico';
ALTER TABLE cards ADD COLUMN IF NOT EXISTS intensity INTEGER DEFAULT 50;

-- 10. Criar cartão padrão para utilizadores existentes que têm categorias
-- (será executado pelo frontend via código, não aqui)

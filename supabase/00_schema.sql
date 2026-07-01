-- SUPABASE SQL (CORRIGIDO)
-- Observação: este ficheiro contém a versão corrigida das partes principais do script.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE ON UPDATE CASCADE,
  full_name text,
  phone text,
  country text,
  avatar_url text,
  role text NOT NULL DEFAULT 'user' CHECK (role IN ('user','admin','moderator')),
  plan text NOT NULL DEFAULT 'Gratuito',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE ON UPDATE CASCADE,
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('income','expense')),
  subtype text DEFAULT 'Nenhum',
  parent_id uuid REFERENCES categories(id) ON DELETE SET NULL ON UPDATE CASCADE,
  target_amount numeric(15,2) NOT NULL DEFAULT 0 CHECK (target_amount>=0)
);

CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE ON UPDATE CASCADE,
  type text NOT NULL CHECK (type IN ('income','expense')),
  amount numeric(15,2) NOT NULL CHECK (amount>=0),
  description text,
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL ON UPDATE CASCADE,
  account text DEFAULT 'Banco',
  status text NOT NULL DEFAULT 'confirmado'
    CHECK (status IN ('confirmado','pendente','cancelado')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE ON UPDATE CASCADE,
  title text NOT NULL,
  target_amount numeric(15,2) NOT NULL CHECK(target_amount>0),
  current_amount numeric(15,2) NOT NULL DEFAULT 0 CHECK(current_amount>=0),
  deadline date
);

CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE ON UPDATE CASCADE,
  message text NOT NULL,
  read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE NOT NULL REFERENCES profiles(id) ON DELETE CASCADE ON UPDATE CASCADE,
  theme text NOT NULL DEFAULT 'dark' CHECK(theme IN ('light','dark')),
  currency text NOT NULL DEFAULT 'AOA',
  notifications_enabled boolean NOT NULL DEFAULT true
);

CREATE INDEX idx_transactions_user ON transactions(user_id);
CREATE INDEX idx_categories_user ON categories(user_id);
CREATE INDEX idx_goals_user ON goals(user_id);
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_profiles_role ON profiles(role);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own profile" ON profiles FOR SELECT USING(auth.uid()=id);
CREATE POLICY "Users update own profile" ON profiles FOR UPDATE USING(auth.uid()=id);

CREATE POLICY "Users view own transactions" ON transactions FOR SELECT USING(auth.uid()=user_id);
CREATE POLICY "Users insert own transactions" ON transactions FOR INSERT WITH CHECK(auth.uid()=user_id);
CREATE POLICY "Users update own transactions" ON transactions FOR UPDATE USING(auth.uid()=user_id);
CREATE POLICY "Users delete own transactions" ON transactions FOR DELETE USING(auth.uid()=user_id);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path=public
AS $$
BEGIN
INSERT INTO public.profiles(id,full_name,phone,country,role)
VALUES(
  NEW.id,
  COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
  NEW.raw_user_meta_data->>'phone',
  NEW.raw_user_meta_data->>'country',
  'user'
);
 INSERT INTO public.settings(user_id)
VALUES(NEW.id)
ON CONFLICT (user_id) DO NOTHING;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();

DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE profiles;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;

  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE transactions;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;

  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE categories;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;

  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE goals;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
END $$;
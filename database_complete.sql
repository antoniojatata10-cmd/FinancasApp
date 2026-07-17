-- =============================================================================
-- FINANÇA AO PONTO - DATABASE COMPLETE SCHEMA (SUPABASE)
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- 1. TABELAS DE PERFIS E CONFIGURAÇÕES
-- ==========================================

CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  phone text,
  country text,
  avatar_url text,
  role text NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin', 'superadmin')),
  plan text NOT NULL DEFAULT 'Gratuito' CHECK (plan IN ('Gratuito', 'Pro')),
  is_active boolean NOT NULL DEFAULT true,
  plan_expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  theme text NOT NULL DEFAULT 'dark' CHECK (theme IN ('light', 'dark')),
  currency text NOT NULL DEFAULT 'AOA',
  notifications_enabled boolean NOT NULL DEFAULT true,
  low_balance_limit numeric(15,2) NOT NULL DEFAULT 5000.00
);

-- ==========================================
-- 2. TABELAS FINANCEIRAS
-- ==========================================

CREATE TABLE IF NOT EXISTS public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('income', 'expense')),
  subtype text DEFAULT 'Nenhum',
  parent_id uuid REFERENCES public.categories(id) ON DELETE SET NULL,
  target_amount numeric(15,2) NOT NULL DEFAULT 0.00 CHECK (target_amount >= 0),
  monthly_limit numeric(15,2) NOT NULL DEFAULT 0.00 CHECK (monthly_limit >= 0)
);

CREATE TABLE IF NOT EXISTS public.transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('income', 'expense')),
  amount numeric(15,2) NOT NULL CHECK (amount >= 0),
  description text,
  category_id uuid REFERENCES public.categories(id) ON DELETE SET NULL,
  account text DEFAULT 'Banco',
  status text NOT NULL DEFAULT 'confirmado' CHECK (status IN ('confirmado', 'pendente', 'cancelado')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  target_amount numeric(15,2) NOT NULL CHECK (target_amount > 0),
  current_amount numeric(15,2) NOT NULL DEFAULT 0 CHECK (current_amount >= 0),
  deadline date,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ==========================================
-- 3. PLANOS, SUBSCRICÕES E AUDITORIA
-- ==========================================

CREATE TABLE IF NOT EXISTS public.subscriptions (
  id text PRIMARY KEY,
  user_email text NOT NULL,
  user_name text NOT NULL,
  plano text NOT NULL CHECK (plano IN ('Pro', 'Enterprise')),
  periodo text NOT NULL CHECK (periodo IN ('mensal', 'anual')),
  metodo text NOT NULL,
  valor numeric(15,2) NOT NULL CHECK (valor >= 0),
  comprovativo_nome text NOT NULL,
  comprovativo_url text NOT NULL,
  status text NOT NULL DEFAULT 'Pendente' CHECK (status IN ('Pendente', 'Ativa', 'Expirada', 'Suspensa', 'Cancelada')),
  data_pedido timestamptz NOT NULL DEFAULT now(),
  data_expiracao timestamptz,
  observacao text
);

CREATE TABLE IF NOT EXISTS public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email text NOT NULL,
  acao text NOT NULL,
  details text,
  ip_address text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('new_message', 'new_video', 'payment_approved', 'plan_expired', 'system_update', 'admin_reply')),
  title text NOT NULL,
  message text NOT NULL,
  read boolean NOT NULL DEFAULT false,
  metadata jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ==========================================
-- 4. CONFIGURAÇÕES DE ADMINISTRAÇÃO
-- ==========================================

CREATE TABLE IF NOT EXISTS public.admin_settings (
  key text PRIMARY KEY,
  value text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL
);

ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin settings are readable by all authenticated users" ON public.admin_settings
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admin settings are updatable by admins only" ON public.admin_settings
  FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'superadmin')));

CREATE OR REPLACE VIEW public.admin_users_view AS
SELECT 
  p.id,
  p.full_name,
  p.phone,
  p.country,
  p.role,
  p.plan,
  p.is_active,
  p.created_at,
  p.updated_at,
  u.email,
  u.last_sign_in_at,
  (SELECT COUNT(*) FROM public.transactions t WHERE t.user_id = p.id) AS total_transactions
FROM public.profiles p
LEFT JOIN auth.users u ON u.id = p.id;

-- ==========================================
-- 5. TABELAS DO MÓDULO DE CHAT
-- ==========================================

CREATE TABLE IF NOT EXISTS public.chat_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  is_archived boolean NOT NULL DEFAULT false,
  is_resolved boolean NOT NULL DEFAULT false,
  last_message_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES public.chat_conversations(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content text NOT NULL,
  is_read boolean NOT NULL DEFAULT false,
  is_delivered boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.message_attachments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id uuid NOT NULL REFERENCES public.chat_messages(id) ON DELETE CASCADE,
  file_name text NOT NULL,
  file_url text NOT NULL,
  file_type text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.user_presence (
  user_id uuid PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  is_online boolean NOT NULL DEFAULT false,
  is_typing boolean NOT NULL DEFAULT false,
  typing_in uuid REFERENCES public.chat_conversations(id) ON DELETE SET NULL,
  last_seen timestamptz NOT NULL DEFAULT now()
);

-- ==========================================
-- 6. TABELAS DO CENTRO DE VÍDEOS (ACADEMIA)
-- ==========================================

CREATE TABLE IF NOT EXISTS public.videos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  video_url text NOT NULL,
  thumbnail_url text,
  category text NOT NULL CHECK (category IN ('Educação Financeira', 'Investimentos', 'Empresas', 'Impostos', 'Poupar Dinheiro', 'Planeamento Financeiro', 'Dívidas', 'Orçamento', 'Academia')),
  level text NOT NULL CHECK (level IN ('Iniciante', 'Intermédio', 'Avançado')),
  sort_order integer NOT NULL DEFAULT 0,
  duration integer NOT NULL, -- em segundos
  published_at timestamptz NOT NULL DEFAULT now(),
  plan_allowed text NOT NULL DEFAULT 'Gratuito' CHECK (plan_allowed IN ('Gratuito', 'Pro')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.written_lessons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  content text NOT NULL,
  exercicios jsonb NOT NULL DEFAULT '[]'::jsonb,
  quiz jsonb NOT NULL DEFAULT '[]'::jsonb,
  image_url text,
  category text NOT NULL DEFAULT 'Educação Financeira',
  level text NOT NULL DEFAULT 'Iniciante',
  plan_allowed text NOT NULL DEFAULT 'Gratuito' CHECK (plan_allowed IN ('Gratuito', 'Pro')),
  is_published boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.video_watch_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  video_id uuid NOT NULL REFERENCES public.videos(id) ON DELETE CASCADE,
  watch_time integer NOT NULL DEFAULT 0, -- em segundos
  progress numeric(5,2) NOT NULL DEFAULT 0.00 CHECK (progress >= 0 AND progress <= 100),
  is_completed boolean NOT NULL DEFAULT false,
  last_watched_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, video_id)
);

-- ==========================================
-- 7. ÍNDICES PARA OTIMIZAÇÃO
-- ==========================================

CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_categories_user ON public.categories(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_category ON public.transactions(category_id);
CREATE INDEX IF NOT EXISTS idx_goals_user ON public.goals(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_conv ON public.chat_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_video_watch_stats_user ON public.video_watch_stats(user_id);
CREATE INDEX IF NOT EXISTS idx_videos_plan ON public.videos(plan_allowed);

-- ==========================================
-- 8. CONFIGURAÇÃO DE STORAGE BUCKETS
-- ==========================================

INSERT INTO storage.buckets (id, name, public) 
VALUES 
  ('comprovativos', 'comprovativos', true),
  ('chat_attachments', 'chat_attachments', true),
  ('videos', 'videos', true),
  ('thumbnails', 'thumbnails', true)
ON CONFLICT (id) DO NOTHING;

-- ==========================================
-- 9. ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================

-- Habilitar RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_presence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.written_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_watch_stats ENABLE ROW LEVEL SECURITY;

-- 9.1 Profiles
CREATE POLICY "Profiles are readable by owner and admins" ON public.profiles
  FOR SELECT USING (auth.uid() = id OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'superadmin')));

CREATE POLICY "Profiles are updatable by owner and admins" ON public.profiles
  FOR UPDATE USING (auth.uid() = id OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'superadmin')));

CREATE POLICY "Profiles are insertable by trigger only" ON public.profiles
  FOR INSERT WITH CHECK (true);

-- 9.2 Settings
CREATE POLICY "Settings are readable by owner" ON public.settings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Settings are updatable by owner" ON public.settings
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Settings are insertable by trigger only" ON public.settings
  FOR INSERT WITH CHECK (true);

-- 9.3 Categories
CREATE POLICY "Categories CRUD by owner" ON public.categories
  FOR ALL USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'superadmin')));

-- 9.4 Transactions
CREATE POLICY "Transactions CRUD by owner" ON public.transactions
  FOR ALL USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'superadmin')));

-- 9.5 Goals
CREATE POLICY "Goals CRUD by owner" ON public.goals
  FOR ALL USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'superadmin')));

-- 9.6 Subscriptions
CREATE POLICY "Users read own subscriptions" ON public.subscriptions
  FOR SELECT USING (user_email = auth.email() OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'superadmin')));

CREATE POLICY "Users insert own subscription requests" ON public.subscriptions
  FOR INSERT WITH CHECK (user_email = auth.email());

CREATE POLICY "Admins full control subscriptions" ON public.subscriptions
  FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'superadmin')));

-- 9.7 Audit Logs
CREATE POLICY "Admins read/insert logs" ON public.audit_logs
  FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'superadmin')));

-- 9.8 Notifications
CREATE POLICY "Notifications CRUD by owner" ON public.notifications
  FOR ALL USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'superadmin')));

-- 9.9 Chat Conversations
CREATE POLICY "Conversations check own" ON public.chat_conversations
  FOR ALL USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'superadmin')));

-- 9.10 Chat Messages
CREATE POLICY "Messages check conversation participant" ON public.chat_messages
  FOR ALL USING (
    sender_id = auth.uid() 
    OR EXISTS (SELECT 1 FROM public.chat_conversations WHERE id = conversation_id AND user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'superadmin'))
  );

-- 9.11 Message Attachments
CREATE POLICY "Attachments access control" ON public.message_attachments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.chat_messages msg
      JOIN public.chat_conversations conv ON conv.id = msg.conversation_id
      WHERE msg.id = message_id AND (conv.user_id = auth.uid() OR msg.sender_id = auth.uid())
    )
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'superadmin'))
  );

-- 9.12 Presence
CREATE POLICY "Presence CRUD" ON public.user_presence
  FOR ALL USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'superadmin')));

-- 9.13 Videos
CREATE POLICY "Videos visible based on plan" ON public.videos
  FOR SELECT USING (
    plan_allowed = 'Gratuito'
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND (plan = 'Pro' OR role IN ('admin', 'superadmin')))
  );

CREATE POLICY "Admins control videos" ON public.videos
  FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'superadmin')));

-- 9.14 Written Lessons
CREATE POLICY "Users read published written lessons" ON public.written_lessons
  FOR SELECT USING (is_published = true OR auth.uid() = created_by OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'superadmin')));

CREATE POLICY "Admins insert/update/delete written lessons" ON public.written_lessons
  FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'superadmin')));

-- 9.15 Video Watch Stats
CREATE POLICY "Watch stats CRUD by owner" ON public.video_watch_stats
  FOR ALL USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'superadmin')));

-- ==========================================
-- 10. TRIGGERS E FUNÇÕES AUXILIARES
-- ==========================================

-- Criar perfil automático ao registar utilizador
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone, country, role, plan)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'Nome', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', NEW.raw_user_meta_data->>'Telefone', ''),
    COALESCE(NEW.raw_user_meta_data->>'country', NEW.raw_user_meta_data->>'Pais', 'Angola'),
    'user',
    'Gratuito'
  );

  INSERT INTO public.settings (user_id)
  VALUES (NEW.id);

  INSERT INTO public.user_presence (user_id, is_online, last_seen)
  VALUES (NEW.id, false, now());

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Atualizar last_message_at na conversa automaticamente
CREATE OR REPLACE FUNCTION public.update_conversation_timestamp()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.chat_conversations
  SET last_message_at = NEW.created_at, is_resolved = false
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_new_chat_message ON public.chat_messages;
CREATE TRIGGER on_new_chat_message
  AFTER INSERT ON public.chat_messages
  FOR EACH ROW EXECUTE FUNCTION public.update_conversation_timestamp();

-- Criar conversa de suporte automaticamente se não existir
CREATE OR REPLACE FUNCTION public.ensure_user_conversation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.chat_conversations (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_new_profile_created ON public.profiles;
CREATE TRIGGER on_new_profile_created
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.ensure_user_conversation();

-- Disparar notificações para novos vídeos para todos
CREATE OR REPLACE FUNCTION public.notify_on_new_video()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  profile_rec RECORD;
BEGIN
  FOR profile_rec IN SELECT id FROM public.profiles WHERE is_active = true LOOP
    INSERT INTO public.notifications (user_id, type, title, message, metadata)
    VALUES (
      profile_rec.id,
      'new_video',
      'Nova Aula Publicada!',
      'Um novo vídeo intitulado "' || NEW.title || '" foi adicionado à Academia Financeira.',
      json_build_object('video_id', NEW.id)
    );
  END LOOP;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_new_video_published ON public.videos;
CREATE TRIGGER on_new_video_published
  AFTER INSERT ON public.videos
  FOR EACH ROW EXECUTE FUNCTION public.notify_on_new_video();

-- Função para expirar planos automaticamente
CREATE OR REPLACE FUNCTION public.expire_plans()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.profiles
  SET plan = 'Gratuito'
  WHERE plan = 'Pro'
    AND plan_expires_at IS NOT NULL
    AND plan_expires_at < now();
END;
$$;

-- Habilitar replicação Realtime
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

  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE subscriptions;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;

  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;

  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE chat_conversations;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;

  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;

  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE user_presence;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
END $$;

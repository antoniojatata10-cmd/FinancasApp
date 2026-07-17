-- ══════════════════════════════════════════════════════════════════════════════
-- FINANÇA AO PONTO — ESQUEMA SUPABASE COMPLETO (REINICIAR E CRIAR)
-- Execute este script no SQL Editor do Supabase (Project → SQL Editor → New query)
-- Versão: 2.1 — Limpa todos os restos do projeto antigo e recria tudo do zero.
-- ══════════════════════════════════════════════════════════════════════════════

-- 1. ELIMINAR TRIGGERS ANTIGOS E APAGAR TABELAS EXISTENTES (Limpeza de "restos")
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS trg_profiles_updated_at ON public.profiles;
DROP TRIGGER IF EXISTS trg_transactions_updated_at ON public.transactions;
DROP TRIGGER IF EXISTS trg_videos_updated_at ON public.videos;
DROP TRIGGER IF EXISTS trg_settings_updated_at ON public.settings;

DROP VIEW IF EXISTS public.admin_users_view CASCADE;
DROP VIEW IF EXISTS public.user_financial_summary CASCADE;

DROP TABLE IF EXISTS public.video_watch_stats CASCADE;
DROP TABLE IF EXISTS public.videos CASCADE;
DROP TABLE IF EXISTS public.chat_messages CASCADE;
DROP TABLE IF EXISTS public.payments CASCADE;
DROP TABLE IF EXISTS public.admin_settings CASCADE;
DROP TABLE IF EXISTS public.settings CASCADE;
DROP TABLE IF EXISTS public.notifications CASCADE;
DROP TABLE IF EXISTS public.goals CASCADE;
DROP TABLE IF EXISTS public.transactions CASCADE;
DROP TABLE IF EXISTS public.categories CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. CRIAR TABELAS COM A ESTRUTURA CORRECTA
-- ─────────────────────────────────────────────────────────────────────────────

-- PROFILES
CREATE TABLE public.profiles (
  id          uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE ON UPDATE CASCADE,
  full_name   text,
  phone       text,
  country     text DEFAULT 'Angola',
  avatar_url  text,
  role        text NOT NULL DEFAULT 'user' CHECK (role IN ('user','admin','moderator')),
  plan        text NOT NULL DEFAULT 'Gratuito' CHECK (plan IN ('Gratuito','Básico','Pro','Enterprise')),
  plan_expires_at timestamptz,
  is_active   boolean NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- CATEGORIAS
CREATE TABLE public.categories (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE ON UPDATE CASCADE,
  name          text NOT NULL,
  type          text NOT NULL CHECK (type IN ('income','expense')),
  subtype       text DEFAULT 'Nenhum',
  parent_id     uuid REFERENCES public.categories(id) ON DELETE SET NULL ON UPDATE CASCADE,
  target_amount numeric(15,2) NOT NULL DEFAULT 0 CHECK (target_amount >= 0),
  monthly_limit numeric(15,2) NOT NULL DEFAULT 0 CHECK (monthly_limit >= 0),
  color         text DEFAULT '#6366f1',
  icon          text DEFAULT '📁',
  created_at    timestamptz NOT NULL DEFAULT now()
);

-- TRANSAÇÕES
CREATE TABLE public.transactions (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE ON UPDATE CASCADE,
  type        text NOT NULL CHECK (type IN ('income','expense')),
  amount      numeric(15,2) NOT NULL CHECK (amount >= 0),
  description text,
  category_id uuid REFERENCES public.categories(id) ON DELETE SET NULL ON UPDATE CASCADE,
  account     text DEFAULT 'Banco',
  status      text NOT NULL DEFAULT 'confirmado' CHECK (status IN ('confirmado','pendente','cancelado')),
  receipt_url text,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- METAS / OBJETIVOS
CREATE TABLE public.goals (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE ON UPDATE CASCADE,
  title          text NOT NULL,
  description    text,
  target_amount  numeric(15,2) NOT NULL CHECK (target_amount > 0),
  current_amount numeric(15,2) NOT NULL DEFAULT 0 CHECK (current_amount >= 0),
  deadline       date,
  is_completed   boolean NOT NULL DEFAULT false,
  created_at     timestamptz NOT NULL DEFAULT now()
);

-- NOTIFICAÇÕES
CREATE TABLE public.notifications (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE ON UPDATE CASCADE,
  title      text,
  message    text NOT NULL,
  type       text NOT NULL DEFAULT 'info' CHECK (type IN ('info','success','warning','error','promo')),
  read       boolean NOT NULL DEFAULT false,
  action_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- DEFINIÇÕES DE UTILIZADOR
CREATE TABLE public.settings (
  id                     uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                uuid UNIQUE NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE ON UPDATE CASCADE,
  theme                  text NOT NULL DEFAULT 'dark' CHECK (theme IN ('light','dark')),
  currency               text NOT NULL DEFAULT 'AOA',
  language               text NOT NULL DEFAULT 'pt',
  notifications_enabled  boolean NOT NULL DEFAULT true,
  low_balance_limit      numeric(15,2) NOT NULL DEFAULT 5000,
  updated_at             timestamptz NOT NULL DEFAULT now()
);

-- CONFIGURAÇÕES DO ADMINISTRADOR
CREATE TABLE public.admin_settings (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key          text UNIQUE NOT NULL,
  value        text,
  updated_at   timestamptz NOT NULL DEFAULT now(),
  updated_by   uuid REFERENCES public.profiles(id) ON DELETE SET NULL
);

-- Valores padrão das configurações de admin
INSERT INTO public.admin_settings (key, value) VALUES
  ('banco',          'BAI')                    ON CONFLICT (key) DO NOTHING;
INSERT INTO public.admin_settings (key, value) VALUES
  ('titular',        'Finança ao Ponto Lda')   ON CONFLICT (key) DO NOTHING;
INSERT INTO public.admin_settings (key, value) VALUES
  ('iban',           'AO06000500001234567891015') ON CONFLICT (key) DO NOTHING;
INSERT INTO public.admin_settings (key, value) VALUES
  ('conta',          '000-1234567-891')         ON CONFLICT (key) DO NOTHING;
INSERT INTO public.admin_settings (key, value) VALUES
  ('telefone',       '923 000 000')             ON CONFLICT (key) DO NOTHING;
INSERT INTO public.admin_settings (key, value) VALUES
  ('referencia',     'FAP-2026')                ON CONFLICT (key) DO NOTHING;
INSERT INTO public.admin_settings (key, value) VALUES
  ('precoMensal',    '2000')                    ON CONFLICT (key) DO NOTHING;
INSERT INTO public.admin_settings (key, value) VALUES
  ('precoAnual',     '20000')                   ON CONFLICT (key) DO NOTHING;
INSERT INTO public.admin_settings (key, value) VALUES
  ('invite_codes',   'AFA2026,FINPRO2026')       ON CONFLICT (key) DO NOTHING;

-- PAGAMENTOS / SUBSCRIÇÕES
CREATE TABLE public.payments (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE ON UPDATE CASCADE,
  plano             text NOT NULL CHECK (plano IN ('Gratuito','Básico','Pro','Enterprise')),
  periodo           text NOT NULL DEFAULT 'mensal' CHECK (periodo IN ('mensal','anual')),
  metodo            text NOT NULL,
  valor             numeric(15,2) NOT NULL CHECK (valor >= 0),
  comprovativo_url  text,
  comprovativo_nome text,
  status            text NOT NULL DEFAULT 'Pendente' CHECK (status IN ('Pendente','Ativa','Expirada','Suspensa','Cancelada')),
  data_pedido       timestamptz NOT NULL DEFAULT now(),
  data_aprovacao    timestamptz,
  data_expiracao    timestamptz,
  aprovado_por      uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  observacao        text,
  created_at        timestamptz NOT NULL DEFAULT now()
);

-- CHAT DE SUPORTE
CREATE TABLE public.chat_messages (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id    uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE ON UPDATE CASCADE,
  receiver_id  uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  room         text NOT NULL DEFAULT 'support',
  message      text NOT NULL,
  attachment_url  text,
  attachment_name text,
  is_read      boolean NOT NULL DEFAULT false,
  is_admin_reply boolean NOT NULL DEFAULT false,
  created_at   timestamptz NOT NULL DEFAULT now()
);

-- VÍDEOS DA ACADEMIA
CREATE TABLE public.videos (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title           text NOT NULL,
  description     text,
  youtube_url     text,
  thumbnail_url   text,
  duration_seconds integer NOT NULL DEFAULT 0,
  level           integer NOT NULL DEFAULT 1 CHECK (level BETWEEN 1 AND 8),
  category        text DEFAULT 'Geral',
  plan_allowed    text NOT NULL DEFAULT 'Gratuito' CHECK (plan_allowed IN ('Gratuito','Pro')),
  is_published    boolean NOT NULL DEFAULT false,
  order_index     integer NOT NULL DEFAULT 0,
  created_by      uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

-- AULAS ESCRITAS (FORMAÇÃO)
CREATE TABLE public.written_lessons (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title         text NOT NULL,
  description   text,
  content       text NOT NULL,
  exercicios    jsonb NOT NULL DEFAULT '[]'::jsonb,
  quiz          jsonb NOT NULL DEFAULT '[]'::jsonb,
  image_url     text,
  category      text NOT NULL DEFAULT 'Educação Financeira',
  level         text NOT NULL DEFAULT 'Iniciante',
  plan_allowed  text NOT NULL DEFAULT 'Gratuito' CHECK (plan_allowed IN ('Gratuito','Pro')),
  is_published  boolean NOT NULL DEFAULT false,
  sort_order    integer NOT NULL DEFAULT 0,
  created_by    uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

-- ESTATÍSTICAS DE VÍDEO
CREATE TABLE public.video_watch_stats (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE ON UPDATE CASCADE,
  video_id       uuid NOT NULL REFERENCES public.videos(id) ON DELETE CASCADE ON UPDATE CASCADE,
  watched_seconds integer NOT NULL DEFAULT 0,
  completed      boolean NOT NULL DEFAULT false,
  last_watched   timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, video_id)
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. ÍNDICES
-- ─────────────────────────────────────────────────────────────────────────────
CREATE INDEX idx_transactions_user      ON public.transactions(user_id);
CREATE INDEX idx_transactions_created   ON public.transactions(created_at DESC);
CREATE INDEX idx_categories_user        ON public.categories(user_id);
CREATE INDEX idx_goals_user             ON public.goals(user_id);
CREATE INDEX idx_notifications_user     ON public.notifications(user_id);
CREATE INDEX idx_notifications_read     ON public.notifications(user_id, read);
CREATE INDEX idx_profiles_role          ON public.profiles(role);
CREATE INDEX idx_payments_user          ON public.payments(user_id);
CREATE INDEX idx_payments_status        ON public.payments(status);
CREATE INDEX idx_chat_sender            ON public.chat_messages(sender_id);
CREATE INDEX idx_chat_receiver          ON public.chat_messages(receiver_id);
CREATE INDEX idx_chat_created           ON public.chat_messages(created_at DESC);
CREATE INDEX idx_videos_level           ON public.videos(level);
CREATE INDEX idx_videos_published       ON public.videos(is_published);
CREATE INDEX idx_video_stats_user       ON public.video_watch_stats(user_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. ROW LEVEL SECURITY (RLS)
-- ─────────────────────────────────────────────────────────────────────────────
ALTER TABLE public.profiles         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_settings   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.videos           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.written_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_watch_stats ENABLE ROW LEVEL SECURITY;

-- Função auxiliar admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- POLICIES: profiles
CREATE POLICY "profiles_select_own"   ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_admin_select" ON public.profiles FOR SELECT USING (public.is_admin());
CREATE POLICY "profiles_insert_own"   ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own"   ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_admin_update" ON public.profiles FOR UPDATE USING (public.is_admin());

-- POLICIES: categories
CREATE POLICY "categories_own"   ON public.categories FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "categories_admin" ON public.categories FOR ALL USING (public.is_admin());

-- POLICIES: transactions
CREATE POLICY "transactions_own"   ON public.transactions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "transactions_admin" ON public.transactions FOR ALL USING (public.is_admin());

-- POLICIES: goals
CREATE POLICY "goals_own"   ON public.goals FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "goals_admin" ON public.goals FOR ALL USING (public.is_admin());

-- POLICIES: notifications
CREATE POLICY "notifications_own"   ON public.notifications FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "notifications_admin" ON public.notifications FOR ALL USING (public.is_admin());

-- POLICIES: settings
CREATE POLICY "settings_own"   ON public.settings FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "settings_admin" ON public.settings FOR ALL USING (public.is_admin());

-- POLICIES: admin_settings
CREATE POLICY "admin_settings_read_all" ON public.admin_settings FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "admin_settings_write"    ON public.admin_settings FOR ALL USING (public.is_admin());

-- POLICIES: payments
CREATE POLICY "payments_own"   ON public.payments FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "payments_admin" ON public.payments FOR ALL USING (public.is_admin());

-- POLICIES: chat_messages
CREATE POLICY "chat_select_participant" ON public.chat_messages FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
CREATE POLICY "chat_insert_own"         ON public.chat_messages FOR INSERT WITH CHECK (auth.uid() = sender_id);
CREATE POLICY "chat_admin_all"          ON public.chat_messages FOR ALL USING (public.is_admin());

-- POLICIES: videos
CREATE POLICY "videos_read_published" ON public.videos FOR SELECT USING (auth.uid() IS NOT NULL AND is_published = true);
CREATE POLICY "videos_admin_all"      ON public.videos FOR ALL USING (public.is_admin());

-- POLICIES: written_lessons
CREATE POLICY "wl_read_published" ON public.written_lessons FOR SELECT USING (is_published = true OR auth.uid() = created_by OR public.is_admin());
CREATE POLICY "wl_admin_all"      ON public.written_lessons FOR ALL USING (public.is_admin());

-- POLICIES: video_watch_stats
CREATE POLICY "vws_own"   ON public.video_watch_stats FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "vws_admin" ON public.video_watch_stats FOR ALL USING (public.is_admin());

-- ─────────────────────────────────────────────────────────────────────────────
-- 5. VIEWS
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE VIEW public.admin_users_view AS
SELECT
  p.id,
  p.full_name,
  p.phone,
  p.country,
  p.role,
  p.plan,
  p.plan_expires_at,
  p.is_active,
  p.created_at,
  u.email,
  u.last_sign_in_at,
  (SELECT COUNT(*) FROM public.transactions t WHERE t.user_id = p.id) AS total_transactions,
  (SELECT COUNT(*) FROM public.payments py WHERE py.user_id = p.id AND py.status = 'Ativa') AS active_subscriptions
FROM public.profiles p
LEFT JOIN auth.users u ON u.id = p.id;

CREATE OR REPLACE VIEW public.user_financial_summary AS
SELECT
  p.id AS user_id,
  p.full_name,
  COALESCE(SUM(CASE WHEN t.type = 'income'  THEN t.amount ELSE 0 END), 0) AS total_receitas,
  COALESCE(SUM(CASE WHEN t.type = 'expense' THEN t.amount ELSE 0 END), 0) AS total_despesas,
  COALESCE(SUM(CASE WHEN t.type = 'income'  THEN t.amount ELSE -t.amount END), 0) AS saldo,
  COUNT(t.id) AS total_transacoes
FROM public.profiles p
LEFT JOIN public.transactions t ON t.user_id = p.id
GROUP BY p.id, p.full_name;

-- ─────────────────────────────────────────────────────────────────────────────
-- 6. SQL FUNCTIONS & TRIGGERS
-- ─────────────────────────────────────────────────────────────────────────────

-- Trigger: Criar profile + settings automaticamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone, country, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'phone',
    COALESCE(NEW.raw_user_meta_data->>'country', 'Angola'),
    'user'
  )
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.settings (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger: Atualização automática de updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER trg_transactions_updated_at
  BEFORE UPDATE ON public.transactions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER trg_videos_updated_at
  BEFORE UPDATE ON public.videos
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER trg_settings_updated_at
  BEFORE UPDATE ON public.settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Função: Aprovar pagamento
CREATE OR REPLACE FUNCTION public.approve_payment(payment_id uuid, admin_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_payment public.payments%ROWTYPE;
  v_expiry  timestamptz;
BEGIN
  SELECT * INTO v_payment FROM public.payments WHERE id = payment_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Pagamento não encontrado: %', payment_id;
  END IF;

  IF v_payment.periodo = 'anual' THEN
    v_expiry := now() + interval '1 year';
  ELSE
    v_expiry := now() + interval '1 month';
  END IF;

  UPDATE public.payments
  SET status          = 'Ativa',
      data_aprovacao  = now(),
      data_expiracao  = v_expiry,
      aprovado_por    = admin_id
  WHERE id = payment_id;

  UPDATE public.profiles
  SET plan            = v_payment.plano,
      plan_expires_at = v_expiry,
      updated_at      = now()
  WHERE id = v_payment.user_id;

  INSERT INTO public.notifications (user_id, title, message, type)
  VALUES (
    v_payment.user_id,
    '🎉 Subscrição Activada!',
    'O seu plano ' || v_payment.plano || ' foi activado com sucesso. Válido até ' || to_char(v_expiry, 'DD/MM/YYYY') || '.',
    'success'
  );
END;
$$;

-- Função: Rejeitar pagamento
CREATE OR REPLACE FUNCTION public.reject_payment(payment_id uuid, admin_id uuid, motivo text DEFAULT '')
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_user_id uuid;
BEGIN
  SELECT user_id INTO v_user_id FROM public.payments WHERE id = payment_id;

  UPDATE public.payments
  SET status         = 'Cancelada',
      aprovado_por   = admin_id,
      observacao     = motivo,
      data_aprovacao = now()
  WHERE id = payment_id;

  INSERT INTO public.notifications (user_id, title, message, type)
  VALUES (
    v_user_id,
    '❌ Pedido Rejeitado',
    COALESCE('O seu pedido de subscrição foi rejeitado. ' || motivo, 'O seu pedido de subscrição foi rejeitado. Contacte o suporte.'),
    'error'
  );
END;
$$;

-- ─────────────────────────────────────────────────────────────────────────────
-- 7. BUCKETS DE STORAGE (SUPABASE STORAGE)
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'comprovativos',
  'comprovativos',
  false,
  5242880, -- 5 MB
  ARRAY['image/jpeg','image/png','image/webp','image/gif','application/pdf']
)
ON CONFLICT (id) DO UPDATE
  SET file_size_limit = 5242880,
      allowed_mime_types = ARRAY['image/jpeg','image/png','image/webp','image/gif','application/pdf'];

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'chat-attachments',
  'chat-attachments',
  false,
  5242880,
  ARRAY['image/jpeg','image/png','image/webp','image/gif','application/pdf']
)
ON CONFLICT (id) DO UPDATE
  SET file_size_limit = 5242880;

INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('videos', 'videos', true, 524288000)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('thumbnails', 'thumbnails', true, 2097152, ARRAY['image/jpeg','image/png','image/webp'])
ON CONFLICT (id) DO NOTHING;

-- Relações de políticas para Storage (Objects)
DROP POLICY IF EXISTS "comprov_upload_own"  ON storage.objects;
DROP POLICY IF EXISTS "comprov_read_own"    ON storage.objects;
DROP POLICY IF EXISTS "comprov_admin_read"  ON storage.objects;

CREATE POLICY "comprov_upload_own" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'comprovativos' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "comprov_read_own" ON storage.objects FOR SELECT USING (bucket_id = 'comprovativos' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "comprov_admin_read" ON storage.objects FOR SELECT USING (bucket_id = 'comprovativos' AND public.is_admin());

DROP POLICY IF EXISTS "chat_attach_upload" ON storage.objects;
DROP POLICY IF EXISTS "chat_attach_read" ON storage.objects;
CREATE POLICY "chat_attach_upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'chat-attachments' AND auth.uid() IS NOT NULL);
CREATE POLICY "chat_attach_read" ON storage.objects FOR SELECT USING (bucket_id = 'chat-attachments' AND auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "thumbnails_admin_manage" ON storage.objects;
DROP POLICY IF EXISTS "thumbnails_public_read" ON storage.objects;
CREATE POLICY "thumbnails_admin_manage" ON storage.objects FOR ALL USING (bucket_id = 'thumbnails' AND public.is_admin());
CREATE POLICY "thumbnails_public_read" ON storage.objects FOR SELECT USING (bucket_id = 'thumbnails');

DROP POLICY IF EXISTS "videos_admin_manage" ON storage.objects;
DROP POLICY IF EXISTS "videos_public_read" ON storage.objects;
CREATE POLICY "videos_admin_manage" ON storage.objects FOR ALL USING (bucket_id = 'videos' AND public.is_admin());
CREATE POLICY "videos_public_read" ON storage.objects FOR SELECT USING (bucket_id = 'videos');

-- ─────────────────────────────────────────────────────────────────────────────
-- 8. CONFIGURAR SUPABASE REALTIME
-- ─────────────────────────────────────────────────────────────────────────────
DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
  EXCEPTION WHEN duplicate_object THEN NULL; END;

  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.transactions;
  EXCEPTION WHEN duplicate_object THEN NULL; END;

  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.categories;
  EXCEPTION WHEN duplicate_object THEN NULL; END;

  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.goals;
  EXCEPTION WHEN duplicate_object THEN NULL; END;

  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
  EXCEPTION WHEN duplicate_object THEN NULL; END;

  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.payments;
  EXCEPTION WHEN duplicate_object THEN NULL; END;

  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
  EXCEPTION WHEN duplicate_object THEN NULL; END;
END $$;
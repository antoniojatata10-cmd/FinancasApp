-- ============================================================
-- SQL para Supabase — Finança ao Ponto
-- Execute este ficheiro na secção SQL Editor do Supabase
-- ============================================================

-- 1. Função para revogar plano manualmente (admin)
CREATE OR REPLACE FUNCTION public.revoke_plan(target_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.profiles
  SET plan = 'Gratuito',
      plan_expires_at = null,
      updated_at = now()
  WHERE id = target_user_id;

  UPDATE public.payments
  SET status = 'Expirada'
  WHERE user_id = target_user_id
    AND status = 'Ativa';
END;
$$;

-- 2. Função de expiração automática (chamar periodicamente ou como trigger)
CREATE OR REPLACE FUNCTION public.expire_plans()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Reverter planos expirados para Gratuito
  UPDATE public.profiles
  SET plan = 'Gratuito',
      updated_at = now()
  WHERE plan != 'Gratuito'
    AND plan_expires_at IS NOT NULL
    AND plan_expires_at < now();

  -- Marcar pagamentos como Expirados
  UPDATE public.payments
  SET status = 'Expirada'
  WHERE status = 'Ativa'
    AND data_expiracao IS NOT NULL
    AND data_expiracao < now();
END;
$$;

-- 3. Garantir que a tabela payments tem coluna data_expiracao
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'payments' AND column_name = 'data_expiracao'
  ) THEN
    ALTER TABLE public.payments ADD COLUMN data_expiracao timestamptz;
  END IF;
END;
$$;

-- 4. Atualizar data_expiracao quando um pagamento é aprovado
-- (adicionar ao trigger existente approve_payment ou criar novo)
CREATE OR REPLACE FUNCTION public.approve_payment(payment_id uuid, admin_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id uuid;
  v_plano text;
  v_periodo text;
  v_expires_at timestamptz;
BEGIN
  -- Obter dados do pagamento
  SELECT user_id, plano, periodo INTO v_user_id, v_plano, v_periodo
  FROM public.payments
  WHERE id = payment_id;

  -- Calcular data de expiração
  IF v_periodo = 'anual' THEN
    v_expires_at := now() + interval '1 year';
  ELSE
    v_expires_at := now() + interval '1 month';
  END IF;

  -- Aprovar pagamento
  UPDATE public.payments
  SET status = 'Ativa',
      aprovado_por = admin_id,
      data_aprovacao = now(),
      data_expiracao = v_expires_at
  WHERE id = payment_id;

  -- Actualizar perfil do utilizador
  UPDATE public.profiles
  SET plan = v_plano,
      plan_expires_at = v_expires_at,
      updated_at = now()
  WHERE id = v_user_id;
END;
$$;

-- 5. Política RLS para chat_conversations (se a tabela existir)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_name = 'chat_conversations'
  ) THEN
    -- Utilizadores podem ver as suas próprias conversas
    DROP POLICY IF EXISTS "Users can view own conversations" ON public.chat_conversations;
    CREATE POLICY "Users can view own conversations" ON public.chat_conversations
      FOR SELECT USING (auth.uid() = user_id);

    -- Admins podem ver todas as conversas
    DROP POLICY IF EXISTS "Admins can view all conversations" ON public.chat_conversations;
    CREATE POLICY "Admins can view all conversations" ON public.chat_conversations
      FOR ALL USING (
        EXISTS (
          SELECT 1 FROM public.profiles
          WHERE id = auth.uid() AND role = 'admin'
        )
      );
  END IF;
END;
$$;

-- 6. Garantir que a coluna plan_expires_at existe em profiles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'plan_expires_at'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN plan_expires_at timestamptz;
  END IF;
END;
$$;

-- ============================================================
-- 7. TABELAS E POLÍTICAS DO MÓDULO DE CHAT
-- ============================================================

-- Recriar chat_messages com a estrutura correta se necessário
DO $$
BEGIN
  -- Se chat_messages existir mas não tiver a coluna conversation_id, dropamos para recriar com a estrutura nova
  IF EXISTS (
    SELECT 1 FROM information_schema.tables WHERE table_name = 'chat_messages' AND table_schema = 'public'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns WHERE table_name = 'chat_messages' AND column_name = 'conversation_id' AND table_schema = 'public'
  ) THEN
    DROP TABLE IF EXISTS public.chat_messages CASCADE;
  END IF;
END;
$$;

-- Criar chat_conversations
CREATE TABLE IF NOT EXISTS public.chat_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  is_archived boolean NOT NULL DEFAULT false,
  is_resolved boolean NOT NULL DEFAULT false,
  last_message_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Criar chat_messages (nova estrutura)
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES public.chat_conversations(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content text NOT NULL,
  is_read boolean NOT NULL DEFAULT false,
  is_delivered boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Criar message_attachments
CREATE TABLE IF NOT EXISTS public.message_attachments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id uuid NOT NULL REFERENCES public.chat_messages(id) ON DELETE CASCADE,
  file_name text NOT NULL,
  file_url text NOT NULL,
  file_type text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Criar user_presence
CREATE TABLE IF NOT EXISTS public.user_presence (
  user_id uuid PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  is_online boolean NOT NULL DEFAULT false,
  is_typing boolean NOT NULL DEFAULT false,
  typing_in uuid REFERENCES public.chat_conversations(id) ON DELETE SET NULL,
  last_seen timestamptz NOT NULL DEFAULT now()
);

-- Habilitar RLS nas tabelas de chat
ALTER TABLE public.chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_presence ENABLE ROW LEVEL SECURITY;

-- Políticas para chat_conversations
DROP POLICY IF EXISTS "Users can manage own conversation" ON public.chat_conversations;
CREATE POLICY "Users can manage own conversation" ON public.chat_conversations
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can manage all conversations" ON public.chat_conversations;
CREATE POLICY "Admins can manage all conversations" ON public.chat_conversations
  FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'superadmin'))
  );

-- Políticas para chat_messages
DROP POLICY IF EXISTS "Users can manage messages in own conversation" ON public.chat_messages;
CREATE POLICY "Users can manage messages in own conversation" ON public.chat_messages
  FOR ALL TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.chat_conversations c
      WHERE c.id = conversation_id AND c.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Admins can manage all messages" ON public.chat_messages;
CREATE POLICY "Admins can manage all messages" ON public.chat_messages
  FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'superadmin'))
  );

-- Políticas para message_attachments
DROP POLICY IF EXISTS "Users can view attachments in own conversation" ON public.message_attachments;
CREATE POLICY "Users can view attachments in own conversation" ON public.message_attachments
  FOR ALL TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.chat_messages m
      JOIN public.chat_conversations c ON c.id = m.conversation_id
      WHERE m.id = message_id AND c.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Admins can manage all attachments" ON public.message_attachments;
CREATE POLICY "Admins can manage all attachments" ON public.message_attachments
  FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'superadmin'))
  );

-- Políticas para user_presence
DROP POLICY IF EXISTS "Users can manage own presence" ON public.user_presence;
CREATE POLICY "Users can manage own presence" ON public.user_presence
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view all presence" ON public.user_presence;
CREATE POLICY "Users can view all presence" ON public.user_presence
  FOR SELECT TO authenticated USING (true);

-- NOTA: Pode agendar a função expire_plans() como um cron job no Supabase:
-- Extensions > pg_cron > SELECT cron.schedule('expire_plans', '0 * * * *', 'SELECT public.expire_plans()');

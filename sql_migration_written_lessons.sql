-- ════════════════════════════════════════════════════════════
-- MIGRAÇÃO: Adicionar exercicios + quiz às aulas escritas
-- Executar no SQL Editor do Supabase Dashboard
-- ════════════════════════════════════════════════════════════

-- 1. Criar tabela se não existir
CREATE TABLE IF NOT EXISTS public.written_lessons (
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

-- 2. Se a tabela já existe mas falta exercicios/quiz
ALTER TABLE public.written_lessons
  ADD COLUMN IF NOT EXISTS exercicios jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS quiz jsonb NOT NULL DEFAULT '[]'::jsonb;

-- 3. Activar RLS
ALTER TABLE public.written_lessons ENABLE ROW LEVEL SECURITY;

-- 4. Remover policies antigas
DROP POLICY IF EXISTS "wl_read_published" ON public.written_lessons;
DROP POLICY IF EXISTS "wl_admin_all" ON public.written_lessons;

-- 5. Criar policies novas
CREATE POLICY "wl_read_published" ON public.written_lessons
  FOR SELECT USING (is_published = true OR auth.uid() = created_by OR public.is_admin());

CREATE POLICY "wl_admin_all" ON public.written_lessons
  FOR ALL USING (public.is_admin());

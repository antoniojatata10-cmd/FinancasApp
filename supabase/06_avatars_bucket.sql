-- =============================================
-- BUCKET AVATARS - Executar no Supabase SQL Editor
-- Se der erro de "already exists", ignorar
-- =============================================

-- 1. Criar bucket avatars (público)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('avatars', 'avatars', true, 5242880, ARRAY['image/png', 'image/jpeg', 'image/webp', 'image/gif'])
ON CONFLICT (id) DO UPDATE SET public = true, file_size_limit = 5242880;

-- 2. Remover políticas antigas se existirem
DROP POLICY IF EXISTS "Users can upload own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Public can view avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Avatar upload" ON storage.objects;
DROP POLICY IF EXISTS "Avatar read" ON storage.objects;
DROP POLICY IF EXISTS "Avatar update" ON storage.objects;
DROP POLICY IF EXISTS "Avatar delete" ON storage.objects;

-- 3. Política simples: qualquer utilizador autenticado pode fazer upload
CREATE POLICY "Avatar upload"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'avatars');

-- 4. Qualquer pessoa pode ler avatars (bucket público)
CREATE POLICY "Avatar read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

-- 5. Utilizadores autenticados podem atualizar
CREATE POLICY "Avatar update"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'avatars');

-- 6. Utilizadores autenticados podem eliminar
CREATE POLICY "Avatar delete"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'avatars');
